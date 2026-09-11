import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { donorEmail } = req.query;
  let donations = serverStore.getDonations();
  if (donorEmail && typeof donorEmail === 'string') {
    donations = donations.filter(d => d.donorEmail.toLowerCase() === donorEmail.toLowerCase());
  }
  res.json({ success: true, data: donations });
});

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

// Manual Hand Cash recording endpoint (Volunteers and Admin)
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

// Update donation status or notes (Volunteer verification or Admin review)
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, notes, reviewer } = req.body;

    const updated = serverStore.updateDonation(
      id,
      { status, receiptNote: notes },
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
