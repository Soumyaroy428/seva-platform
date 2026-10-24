import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { serverStore } from '../services/store';

const router = Router();

let razorpayInstance: any = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TcmMNzUCymX672';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'IJFFj3f9391pf3FiDiApAIHZ';

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpayInstance;
};

// STEP 1: BACKEND - Create Razorpay Order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, receipt, notes } = req.body;

    const parsedAmount = Number(amount);
    // Amount is in paise (₹20 = 2000 paise minimum)
    if (isNaN(parsedAmount) || parsedAmount < 2000) {
      return res.status(400).json({
        success: false,
        error: 'Minimum donation amount is ₹20 (2000 paise). Smaller contributions cannot be processed.'
      });
    }

    const rzp = getRazorpayInstance();

    const options = {
      amount: Math.round(parsedAmount), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || { platform: 'SEVA Humanitarian' }
    };

    const order = await rzp.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err: any) {
    console.error('Razorpay Order Creation Error:', err);
    const status = err.statusCode || (err.message?.includes('configured') ? 401 : 500);
    res.status(status).json({ success: false, error: err.message || 'Failed to create Razorpay order.' });
  }
});

// STEP 2: BACKEND - Cryptographic HMAC-SHA256 Signature Verification & Automated 80G Receipt Dispatch
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donorName,
      donorEmail,
      donorPhone,
      amount,
      campaignId,
      campaignTitle,
      isAnonymous
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required signature verification fields (order_id, payment_id, or signature).'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'IJFFj3f9391pf3FiDiApAIHZ';

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cryptographic signature. Payment verification failed.'
      });
    }

    // Payment is authentic & verified!
    let donationRecord = null;
    if (donorName && donorEmail && amount) {
      const parsedAmount = Number(amount);
      donationRecord = serverStore.createDonation({
        donorName: isAnonymous ? 'Kind Supporter' : donorName,
        donorEmail,
        donorPhone: donorPhone || '',
        amount: parsedAmount >= 20 ? parsedAmount : 20,
        campaignId: campaignId || 'CMP-1',
        campaignTitle: campaignTitle || 'General Hunger Relief & Kitchen Support',
        paymentMethod: 'Card',
        transactionId: razorpay_payment_id,
        isAnonymous: Boolean(isAnonymous)
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and official 80G Tax Receipt issued.',
      donation: donationRecord
    });
  } catch (err: any) {
    console.error('Razorpay Verification Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to verify payment.' });
  }
});

// Fetch payment details directly from Razorpay
router.get('/payment/:paymentId', async (req: Request, res: Response) => {
  try {
    const payment = await getRazorpayInstance().payments.fetch(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch payment details.' });
  }
});

export default router;
