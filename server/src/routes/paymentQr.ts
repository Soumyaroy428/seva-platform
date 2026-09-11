import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const all = req.query.all === 'true';
  const qrs = all ? serverStore.getPaymentQRs() : serverStore.getActivePaymentQRs();
  res.json({ success: true, data: qrs });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { title, upiId, accountName, location, qrImageUrl, uploadedBy } = req.body;
    if (!title || !upiId || !accountName || !qrImageUrl) {
      return res.status(400).json({ success: false, error: 'Title, UPI ID, Account Name, and QR image are required.' });
    }
    const newQR = serverStore.addPaymentQR({
      title,
      upiId,
      accountName,
      location: location || 'General Area',
      qrImageUrl,
      uploadedBy: uploadedBy || 'Volunteer'
    });
    res.status(201).json({
      success: true,
      message: 'QR uploaded and pending Admin review.',
      data: newQR
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/', (req: Request, res: Response) => {
  try {
    const { qrId, action, reviewer } = req.body;
    if (action === 'approve') {
      const ok = serverStore.approvePaymentQR(qrId, reviewer || 'Admin');
      if (!ok) return res.status(404).json({ success: false, error: 'QR not found' });
      return res.json({ success: true, message: 'QR approved for public donations.' });
    } else if (action === 'reject') {
      const ok = serverStore.rejectPaymentQR(qrId, reviewer || 'Admin');
      if (!ok) return res.status(404).json({ success: false, error: 'QR not found' });
      return res.json({ success: true, message: 'QR rejected.' });
    }
    res.status(400).json({ success: false, error: 'Invalid action.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
