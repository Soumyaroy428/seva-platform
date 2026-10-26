import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

// 1. GET /api/donations — Query & Filter All Donations (Search, Status, Campaign, Method, Dates)
router.get('/', (req: Request, res: Response) => {
  const { donorEmail, status, campaignId, paymentMethod, search, startDate, endDate } = req.query;
  let donations = serverStore.getDonations();

  if (donorEmail && typeof donorEmail === 'string') {
    donations = donations.filter(d => d.donorEmail.toLowerCase() === donorEmail.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'all') {
    const targetStatus = status.toLowerCase();
    donations = donations.filter(d => {
      const s = (d.status || '').toLowerCase();
      if (targetStatus === 'success') return s === 'success' || s === 'successful' || s === 'verified';
      return s === targetStatus;
    });
  }

  if (campaignId && typeof campaignId === 'string' && campaignId !== 'all') {
    donations = donations.filter(d => d.campaignId === campaignId);
  }

  if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'all') {
    donations = donations.filter(d => (d.paymentMethod || '').toLowerCase() === paymentMethod.toLowerCase());
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    donations = donations.filter(d =>
      (d.donationId && d.donationId.toLowerCase().includes(q)) ||
      (d.donorName && d.donorName.toLowerCase().includes(q)) ||
      (d.donorEmail && d.donorEmail.toLowerCase().includes(q)) ||
      (d.donorPhone && d.donorPhone.toLowerCase().includes(q)) ||
      (d.transactionId && d.transactionId.toLowerCase().includes(q))
    );
  }

  if (startDate && typeof startDate === 'string') {
    const start = new Date(startDate).getTime();
    if (!isNaN(start)) {
      donations = donations.filter(d => new Date(d.createdAt || 0).getTime() >= start);
    }
  }

  if (endDate && typeof endDate === 'string') {
    const end = new Date(endDate).getTime();
    if (!isNaN(end)) {
      donations = donations.filter(d => new Date(d.createdAt || 0).getTime() <= end);
    }
  }

  // Sort most recent first
  donations.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  res.json({ success: true, count: donations.length, data: donations });
});

// 2. GET /api/donations/export/csv — Export Authorized Payment Reports in CSV Format
router.get('/export/csv', (req: Request, res: Response) => {
  try {
    const { status, campaignId, paymentMethod, search } = req.query;
    let donations = serverStore.getDonations();

    if (status && typeof status === 'string' && status !== 'all') {
      const targetStatus = status.toLowerCase();
      donations = donations.filter(d => {
        const s = (d.status || '').toLowerCase();
        if (targetStatus === 'success') return s === 'success' || s === 'successful' || s === 'verified';
        return s === targetStatus;
      });
    }

    if (campaignId && typeof campaignId === 'string' && campaignId !== 'all') {
      donations = donations.filter(d => d.campaignId === campaignId);
    }

    if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'all') {
      donations = donations.filter(d => (d.paymentMethod || '').toLowerCase() === paymentMethod.toLowerCase());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      donations = donations.filter(d =>
        (d.donationId && d.donationId.toLowerCase().includes(q)) ||
        (d.donorName && d.donorName.toLowerCase().includes(q)) ||
        (d.donorEmail && d.donorEmail.toLowerCase().includes(q)) ||
        (d.transactionId && d.transactionId.toLowerCase().includes(q))
      );
    }

    donations.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = [
      'Donation ID',
      'Date',
      'Donor Name',
      'Donor Email',
      'Donor Phone',
      'Amount (INR)',
      'Currency',
      'Campaign',
      'Payment Method',
      'Transaction ID / UTR',
      'Status',
      'Verification Source',
      'Verified By',
      'Verified At',
      'Receipt ID',
      'Rejection Reason'
    ];

    const rows = donations.map(d => [
      escapeCsv(d.donationId),
      escapeCsv(d.createdAt ? new Date(d.createdAt).toISOString() : ''),
      escapeCsv(d.isAnonymous ? 'Kind Supporter (Anonymous)' : d.donorName),
      escapeCsv(d.donorEmail),
      escapeCsv(d.donorPhone || ''),
      escapeCsv(d.amount),
      escapeCsv(d.currency || 'INR'),
      escapeCsv(d.campaignTitle),
      escapeCsv(d.paymentMethod),
      escapeCsv(d.transactionId),
      escapeCsv(d.status),
      escapeCsv(d.verificationSource || ''),
      escapeCsv(d.verifiedBy || ''),
      escapeCsv(d.verifiedAt || ''),
      escapeCsv(d.receiptId || ''),
      escapeCsv(d.rejectionReason || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const filename = `seva-payment-report-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/donations — Direct Online Donation
router.post('/', (req: Request, res: Response) => {
  try {
    const { donorName, donorEmail, donorPhone, amount, campaignId, campaignTitle, paymentMethod, transactionId, isAnonymous, recurringFrequency } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 20) {
      return res.status(400).json({
        success: false,
        error: 'Minimum donation amount is ₹20. Smaller amounts cannot be processed.'
      });
    }

    if (!donorName || !donorEmail) {
      return res.status(400).json({
        success: false,
        error: 'Donor name and email are required for receipt generation.'
      });
    }

    const donation = serverStore.createDonation({
      donorName: isAnonymous ? 'Kind Supporter' : donorName,
      donorEmail,
      donorPhone,
      amount: parsedAmount,
      campaignId,
      campaignTitle: campaignTitle || 'General Hunger Relief & Kitchen Support',
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId || `TXN-${Date.now()}`,
      isAnonymous: Boolean(isAnonymous),
      recurringFrequency: recurringFrequency || 'None'
    });

    res.status(201).json({
      success: true,
      message: 'Donation processed successfully. Thank you for your support!',
      data: donation
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/donations/cash — Manual Hand Cash recording endpoint (Volunteers and Admin)
router.post('/cash', (req: Request, res: Response) => {
  try {
    const { donorName, donorPhone, donorEmail, amount, campaignId, campaignTitle, receiptNote, collectedBy, date } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 20) {
      return res.status(400).json({
        success: false,
        error: 'Minimum donation amount is ₹20.'
      });
    }

    if (!donorName) {
      return res.status(400).json({
        success: false,
        error: 'Donor name is required for manual cash recording.'
      });
    }

    const donation = serverStore.createCashDonation({
      donorName,
      donorPhone,
      donorEmail,
      amount: parsedAmount,
      campaignId,
      campaignTitle,
      receiptNote,
      collectedBy: collectedBy || 'Field Volunteer',
      date
    });

    res.status(201).json({
      success: true,
      message: `Successfully recorded manual hand cash receipt of ₹${parsedAmount}.`,
      data: donation
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. POST /api/donations/:id/approve — Admin approves pending manual payment
router.post('/:id/approve', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
    const envAdminPass = process.env.CMS_ADMIN_PASSWORD || 'Admin@123456';
    const isMasterKey = req.headers['x-admin-key'] === envAdminPass;

    const callerUser = token ? serverStore.getUserFromToken(token) : null;
    const isAuthorized = (callerUser && (callerUser.role === 'admin' || callerUser.role === 'volunteer')) || isMasterKey;
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Administrator credentials required to approve payment verification requests.' });
    }

    const id = String(req.params.id);
    const { reviewer, notes } = req.body;

    const donations = serverStore.getDonations();
    const existing = donations.find(d => d.id === id || d.donationId === id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Donation record not found.' });
    }

    if (existing.status === 'SUCCESS' || existing.status === 'Successful' || existing.status === 'Verified') {
      return res.status(400).json({ success: false, error: 'This donation is already verified and marked as SUCCESS.' });
    }

    const updated = serverStore.updateDonation(
      id,
      {
        status: 'SUCCESS',
        verificationSource: 'ADMIN_MANUAL',
        receiptNote: notes || 'Verified and approved by Administrator against bank credit statement.'
      },
      reviewer || 'Administrator'
    );

    res.json({
      success: true,
      message: `Donation ${existing.donationId} approved. 80G tax receipt generated and campaign totals synchronized.`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/donations/:id/reject — Admin rejects manual payment verification
router.post('/:id/reject', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
    const envAdminPass = process.env.CMS_ADMIN_PASSWORD || 'Admin@123456';
    const isMasterKey = req.headers['x-admin-key'] === envAdminPass;

    const callerUser = token ? serverStore.getUserFromToken(token) : null;
    const isAuthorized = (callerUser && (callerUser.role === 'admin' || callerUser.role === 'volunteer')) || isMasterKey;
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Administrator credentials required to approve payment verification requests.' });
    }

    const id = String(req.params.id);
    const { reviewer, rejectionReason } = req.body;

    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'A specific rejection reason is mandatory when rejecting a payment verification.'
      });
    }

    const donations = serverStore.getDonations();
    const existing = donations.find(d => d.id === id || d.donationId === id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Donation record not found.' });
    }

    if (existing.status === 'SUCCESS' || existing.status === 'Successful' || existing.status === 'Verified') {
      return res.status(400).json({ success: false, error: 'Cannot reject a previously verified successful donation.' });
    }

    const updated = serverStore.updateDonation(
      id,
      {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        verificationSource: 'ADMIN_MANUAL',
        receiptNote: `Rejected by Admin: ${rejectionReason.trim()}`
      },
      reviewer || 'Administrator'
    );

    res.json({
      success: true,
      message: `Donation ${existing.donationId} rejected. Rejection reason recorded and donor notified.`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. PATCH /api/donations/:id — Update donation status or notes (Volunteer verification or Admin review)
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
    const envAdminPass = process.env.CMS_ADMIN_PASSWORD || 'Admin@123456';
    const isMasterKey = req.headers['x-admin-key'] === envAdminPass;

    const callerUser = token ? serverStore.getUserFromToken(token) : null;
    const isAuthorized = (callerUser && (callerUser.role === 'admin' || callerUser.role === 'volunteer')) || isMasterKey;
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Administrator credentials required to approve payment verification requests.' });
    }

    const id = String(req.params.id);
    const { status, notes, reviewer, rejectionReason, transactionId, verificationSource } = req.body;

    const updated = serverStore.updateDonation(
      id,
      {
        status,
        receiptNote: notes,
        rejectionReason,
        transactionId,
        verificationSource: verificationSource || 'ADMIN_MANUAL'
      },
      reviewer || 'Volunteer Verification'
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Donation record not found.' });
    }

    res.json({
      success: true,
      message: 'Donation record updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
