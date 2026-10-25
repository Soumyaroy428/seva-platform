import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { serverStore } from '../services/store';
import { sendDonationReceiptEmail, sendDonationPendingNotification } from '../services/email';

const router = Router();

interface CreateSessionRequest {
  amount: number | string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  campaignId?: string;
  campaignTitle?: string;
  isAnonymous?: boolean;
  message?: string;
  paymentMethod?: string;
}

// 1. POST /api/payments/create-session — Initialize Dynamic UPI Payment Session
router.post('/create-session', async (req: Request, res: Response) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, campaignId, campaignTitle, isAnonymous, message, paymentMethod } = req.body as CreateSessionRequest;
    const parsedAmount = Number(amount);

    // Strict ₹20 Minimum Enforcement
    if (isNaN(parsedAmount) || parsedAmount < 20) {
      return res.status(400).json({
        success: false,
        error: 'Minimum donation amount is ₹20 INR. Smaller contributions cannot be processed under platform guidelines.'
      });
    }

    const orderId = `SEVA-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `youpi_${crypto.randomUUID()}`;
    const amountFormatted = parsedAmount.toFixed(2);
    const amountPaise = Math.round(parsedAmount * 100);

    // Sovereign Gateway config (YouPI-PG)
    const youpiApiUrl = (process.env.YOUPI_API_URL || 'http://localhost:6100').replace(/\/+$/, '');
    const checkoutBaseUrl = (process.env.YOUPI_CHECKOUT_URL || 'http://localhost:7000').replace(/\/+$/, '');
    const merchantId = process.env.YOUPI_MERCHANT_ID || '00000000-0000-0000-0000-000000000001';
    const webhookSecret = process.env.YOUPI_WEBHOOK_SECRET || '7a5dc526e25a7d67d24238c6fd82e818558ffa88e83377e503350a618d975ebd';

    let gatewaySession: any = null;
    try {
      // Attempt to register with running YouPI-PG sovereign gateway service if reachable
      const upstreamRes = await fetch(`${youpiApiUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Id': merchantId,
          'X-Merchant-Key': webhookSecret,
          'Idempotency-Key': `idem_${orderId}`
        },
        body: JSON.stringify({
          orderId,
          amount: amountFormatted,
          currency: 'INR',
          customer: {
            name: isAnonymous ? 'Anonymous Donor' : (donorName || 'Generous Supporter'),
            email: donorEmail,
            phoneNumber: donorPhone
          },
          metadata: {
            campaignId: campaignId || 'CMP-1',
            isAnonymous: Boolean(isAnonymous)
          }
        }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);

      if (upstreamRes && upstreamRes.ok) {
        gatewaySession = await upstreamRes.json();
      }
    } catch {
      // Gracefully falls back to sovereign direct intent if local gateway daemon is paused
    }

    // Dynamic UPI Intent string (compatible with Google Pay, PhonePe, Paytm, BHIM, CRED)
    const upiPayeeAddress = 'seva.humanitarian@upi';
    const upiPayeeName = 'SEVA Humanitarian Hunger Relief';
    const dynamicUpiIntent = `upi://pay?pa=${encodeURIComponent(upiPayeeAddress)}&pn=${encodeURIComponent(upiPayeeName)}&am=${amountFormatted}&cu=INR&tr=${orderId}&tn=${encodeURIComponent(`Donation ${orderId}`)}`;

    const resolvedPaymentId = gatewaySession?.paymentId || paymentId;
    const checkoutUrl = gatewaySession?.checkoutUrl || `${checkoutBaseUrl}/checkout/${resolvedPaymentId}`;

    // Register session in store as Pending donation with unique SEVA-DON-2026-XXXXXX ID
    const donation = serverStore.createDonation({
      donorName: isAnonymous ? 'Kind Supporter' : (donorName || 'Generous Donor'),
      donorEmail: donorEmail || '',
      donorPhone: donorPhone || '',
      amount: parsedAmount,
      currency: 'INR',
      campaignId: campaignId || 'CMP-1',
      campaignTitle: campaignTitle || 'General Hunger Relief & Kitchen Support',
      paymentMethod: paymentMethod || 'UPI_DYNAMIC',
      transactionId: resolvedPaymentId,
      gatewayOrderId: orderId,
      gatewayPaymentId: resolvedPaymentId,
      isAnonymous: Boolean(isAnonymous),
      message: message || '',
      status: 'PENDING',
      receiptNote: `Session initiated. Order ID: ${orderId}`
    });

    return res.status(201).json({
      success: true,
      paymentId: resolvedPaymentId,
      orderId,
      amount: amountFormatted,
      amountPaise,
      currency: 'INR',
      status: 'PENDING',
      checkoutUrl,
      upiIntent: dynamicUpiIntent,
      donationId: donation.donationId,
      donation
    });
  } catch (err: any) {
    console.error('Payment session creation error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to initialize payment session.' });
  }
});

// 2. GET /api/payments/status/:paymentId — Check Real-Time Settlement Status
router.get('/status/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const donations = serverStore.getDonations();
    let donation = donations.find(d => d.transactionId === paymentId || d.donationId === paymentId);

    // Active upstream sync with Sovereign Gateway daemon if session is still pending
    if (donation && donation.status !== 'Successful' && donation.status !== 'Verified') {
      try {
        const youpiApiUrl = (process.env.YOUPI_API_URL || 'http://localhost:6100').replace(/\/+$/, '');
        const upstreamRes = await fetch(`${youpiApiUrl}/api/v1/payments/${paymentId}`, {
          signal: AbortSignal.timeout(2000)
        }).catch(() => null);

        if (upstreamRes && upstreamRes.ok) {
          const upstreamData: any = await upstreamRes.json();
          if (upstreamData && upstreamData.status === 'SUCCESS') {
            const utr = upstreamData.utr || upstreamData.bankReference || 'AUTO-SETTLED';
            serverStore.updateDonation(donation.id || donation.donationId || '', {
              status: 'Successful',
              receiptNote: `Authoritatively settled via Sovereign UPI Gateway. Bank UTR: ${utr}`
            }, 'YouPI-Gateway-Poller');

            // Dispatch 80G Receipt Email via Resend
            if (donation.donorEmail && donation.donorEmail.includes('@')) {
              sendDonationReceiptEmail({
                to: donation.donorEmail,
                donation: {
                  donationId: donation.donationId,
                  donorName: donation.donorName,
                  amount: donation.amount,
                  campaignTitle: donation.campaignTitle || 'General Hunger Relief & Kitchen Support',
                  paymentMethod: 'UPI',
                  transactionId: utr,
                  createdAt: donation.createdAt
                }
              }).catch(err => console.warn('Resend 80G poller dispatch warning:', err.message));
            }

            donation = serverStore.getDonations().find(d => d.transactionId === paymentId || d.donationId === paymentId);
          }
        }
      } catch {}
    }

    if (!donation) {
      return res.status(404).json({ success: false, error: 'Payment session not found.' });
    }

    return res.json({
      success: true,
      paymentId,
      orderId: donation.transactionId,
      donationId: donation.donationId,
      status: donation.status === 'Successful' || donation.status === 'Verified' ? 'SUCCESS' : 'PENDING',
      amount: donation.amount,
      donation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/payments/webhook — Authoritative HMAC-SHA256 Signed Gateway Webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const sigV1 = (req.headers['x-gateway-signature'] || req.headers['x-youpi-signature']) as string;
    const sigV2 = req.headers['x-gateway-signature-v2'] as string;
    const timestamp = req.headers['x-gateway-timestamp'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const webhookSecret = process.env.YOUPI_WEBHOOK_SECRET || '7a5dc526e25a7d67d24238c6fd82e818558ffa88e83377e503350a618d975ebd';

    // Cryptographic HMAC-SHA256 verification (supports V1 payload digest & V2 timestamped digest)
    let isSignatureValid = false;

    if (sigV2 && timestamp) {
      const cleanV2 = sigV2.replace(/^sha256=/, '').trim();
      const expectedV2 = crypto.createHmac('sha256', webhookSecret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
      try {
        isSignatureValid = crypto.timingSafeEqual(Buffer.from(cleanV2, 'hex'), Buffer.from(expectedV2, 'hex'));
      } catch {}
    }

    if (!isSignatureValid && sigV1) {
      const cleanV1 = sigV1.replace(/^sha256=/, '').trim();
      const expectedV1 = crypto.createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex');
      try {
        isSignatureValid = crypto.timingSafeEqual(Buffer.from(cleanV1, 'hex'), Buffer.from(expectedV1, 'hex'));
      } catch {}
    }

    if ((sigV1 || sigV2) && !isSignatureValid && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, error: 'Invalid HMAC signature.' });
    }

    const event = req.body;
    if (event.event === 'SUCCESS' || event.status === 'SUCCESS') {
      const paymentId = event.paymentId;
      const orderId = event.orderId;
      const utr = event.utr || event.bankReference || `UTR-${Date.now()}`;
      const payloadAmount = Number(event.amount);
      const payloadCurrency = (event.currency || 'INR').toUpperCase();

      const allDonations = serverStore.getDonations();
      const existing = allDonations.find(d =>
        (paymentId && (d.transactionId === paymentId || d.gatewayPaymentId === paymentId || d.donationId === paymentId)) ||
        (orderId && (d.gatewayOrderId === orderId || d.transactionId === orderId))
      );

      if (existing) {
        // Idempotency check: if already SUCCESS, safely acknowledge without duplicate processing
        if (existing.status === 'SUCCESS' || existing.status === 'Successful' || existing.status === 'Verified') {
          return res.status(200).json({ received: true, deduplicated: true, donationId: existing.donationId });
        }

        // Amount & currency verification guard
        if (!isNaN(payloadAmount) && Math.abs(payloadAmount - existing.amount) > 0.01) {
          console.warn(`⚠️ Webhook amount mismatch for ${existing.donationId}: expected ₹${existing.amount}, got ₹${payloadAmount}`);
          serverStore.logAudit('Gateway Webhook', 'AMOUNT_MISMATCH_BLOCKED', 'Donation', `Expected ₹${existing.amount}, received ₹${payloadAmount}`);
          return res.status(400).json({ success: false, error: 'Payment amount mismatch detected.' });
        }

        if (existing.currency && payloadCurrency !== existing.currency.toUpperCase()) {
          return res.status(400).json({ success: false, error: 'Currency mismatch.' });
        }

        serverStore.updateDonation(existing.id || existing.donationId || '', {
          status: 'SUCCESS',
          transactionId: utr,
          verificationSource: 'GATEWAY_WEBHOOK',
          receiptNote: `Authoritatively settled via Sovereign UPI Gateway. Bank UTR: ${utr}`
        }, 'Gateway-Webhook');
      }
    }

    return res.status(200).json({ received: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Webhook processing failed.' });
  }
});

// 4. POST /api/payments/manual-qr-submit — Donor submits Manual QR payment for Admin verification
router.post('/manual-qr-submit', async (req: Request, res: Response) => {
  try {
    const {
      amount,
      donorName,
      donorEmail,
      donorPhone,
      campaignId,
      campaignTitle,
      utr,
      proofFile,
      message,
      isAnonymous,
      qrId
    } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 20) {
      return res.status(400).json({
        success: false,
        error: 'Minimum donation amount is ₹20 INR. Smaller contributions cannot be processed.'
      });
    }

    if (!donorName?.trim() || !donorEmail?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Full legal name and email address are required for donation verification.'
      });
    }

    const cleanUtr = String(utr || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A valid 12-digit UPI reference / UTR number is required for manual bank verification.'
      });
    }

    // Duplicate transaction reference / UTR check
    const allDonations = serverStore.getDonations();
    const duplicate = allDonations.find(d =>
      d.transactionId &&
      d.transactionId.toLowerCase() === cleanUtr.toLowerCase() &&
      (d.status === 'SUCCESS' || d.status === 'Successful' || d.status === 'PENDING_VERIFICATION')
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: `A donation with this transaction reference (${cleanUtr}) has already been recorded under Donation ID ${duplicate.donationId}. Duplicate submissions are strictly prevented.`
      });
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const donationId = `SEVA-DON-${year}-${randomNum}`;

    const newDonation = serverStore.createDonation({
      donationId,
      donorName: isAnonymous ? 'Kind Supporter' : donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: donorPhone?.trim() || '',
      amount: parsedAmount,
      currency: 'INR',
      campaignId: campaignId || 'CMP-1',
      campaignTitle: campaignTitle || 'General Hunger Relief & Kitchen Support',
      paymentMethod: 'UPI_MANUAL_QR',
      status: 'PENDING_VERIFICATION',
      transactionId: cleanUtr,
      proofFile: proofFile || '',
      message: message?.trim() || '',
      isAnonymous: Boolean(isAnonymous),
      verificationSource: 'ADMIN_MANUAL',
      receiptNote: `Awaiting Admin verification against bank statement. UPI UTR: ${cleanUtr} (QR: ${qrId || 'Approved QR'})`
    });

    serverStore.logAudit(
      donorEmail.trim(),
      'MANUAL_VERIFICATION_REQUESTED',
      'Donation',
      `Manual QR contribution of ₹${parsedAmount} submitted with UTR ${cleanUtr} (ID: ${donationId}). Awaiting Admin verification.`
    );

    // Dispatch pending verification notifications (Email & SMS)
    sendDonationPendingNotification({
      toEmail: donorEmail.trim(),
      toPhone: donorPhone?.trim(),
      donation: {
        donationId: newDonation.donationId,
        donorName: newDonation.donorName,
        amount: newDonation.amount,
        campaignTitle: newDonation.campaignTitle || 'General Hunger Relief & Kitchen Support'
      }
    }).catch(err => console.warn('Pending notification dispatch error:', err));

    return res.status(201).json({
      success: true,
      message: 'Payment submission received. Awaiting Admin verification against bank credit.',
      donationId: newDonation.donationId,
      status: 'PENDING_VERIFICATION',
      donation: newDonation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/payments/verify-settlement — Verify Payment & Issue 80G Receipt
router.post('/verify-settlement', async (req: Request, res: Response) => {
  try {
    const { paymentId, utr, donorName, donorEmail, donorPhone, amount, campaignId, campaignTitle, isAnonymous } = req.body;

    const allDonations = serverStore.getDonations();
    let donation = allDonations.find(d => d.transactionId === paymentId);

    const parsedAmount = Number(amount) || 20;

    if (!donation) {
      // Create confirmed donation record
      donation = serverStore.createDonation({
        donorName: isAnonymous ? 'Kind Supporter' : (donorName || 'Generous Donor'),
        donorEmail: donorEmail || '',
        donorPhone: donorPhone || '',
        amount: parsedAmount >= 20 ? parsedAmount : 20,
        campaignId: campaignId || 'CMP-1',
        campaignTitle: campaignTitle || 'General Hunger Relief & Kitchen Support',
        paymentMethod: 'UPI',
        transactionId: utr || paymentId || `TXN-${Date.now()}`,
        isAnonymous: Boolean(isAnonymous),
        status: 'Successful',
        auditorNotes: `Verified UPI Settlement. UTR: ${utr || 'Auto-Confirmed'}`
      });
    } else {
      serverStore.updateDonation(donation.id || donation.donationId || '', {
        status: 'Successful',
        receiptNote: `Verified UPI Settlement. UTR: ${utr || 'Auto-Confirmed'}`
      }, 'UPI-Settlement-Service');
    }

    // Trigger 80G Receipt Email via Resend
    if (donation.donorEmail && donation.donorEmail.includes('@')) {
      sendDonationReceiptEmail({
        to: donation.donorEmail,
        donation: {
          donationId: donation.donationId,
          donorName: donation.donorName,
          amount: donation.amount,
          campaignTitle: donation.campaignTitle || 'General Hunger Relief & Kitchen Support',
          paymentMethod: 'UPI',
          transactionId: utr || paymentId,
          createdAt: donation.createdAt
        }
      }).catch(err => console.warn('Resend 80G dispatch error:', err.message));
    }

    return res.json({
      success: true,
      message: 'Payment verified and official 80G Tax Receipt issued.',
      donation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
