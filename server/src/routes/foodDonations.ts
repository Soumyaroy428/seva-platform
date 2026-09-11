import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getFoodDonations() });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { donorName, donorPhone, foodType, quantity, estimatedServings, preparedAt, safeUntil, dietaryCategory, packaging, pickupLocation, pickupTime, notes } = req.body;

    if (!donorName || !donorPhone || !foodType || !estimatedServings || !safeUntil || !pickupLocation) {
      return res.status(400).json({ success: false, error: 'All mandatory food safety and pickup fields must be completed.' });
    }

    const safeDate = new Date(safeUntil);
    if (isNaN(safeDate.getTime()) || safeDate.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Food past its safe consumption time cannot be accepted under food safety guidelines.'
      });
    }

    const donation = serverStore.createFoodDonation({
      donorName,
      donorPhone,
      foodType,
      quantity: quantity || `${estimatedServings} meal portions`,
      estimatedServings: Number(estimatedServings),
      preparedAt: preparedAt || new Date().toISOString(),
      safeUntil,
      dietaryCategory: dietaryCategory || 'Vegetarian',
      packaging: packaging || 'Sealed Container',
      pickupLocation,
      pickupTime: pickupTime || 'Immediate',
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Food donation scheduled. Mobile relief van notified.',
      data: donation
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }
    const updated = serverStore.updateFoodDonationStatus(req.params.id as string, status, notes);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Food donation record not found' });
    }
    res.json({ success: true, message: 'Rescue pickup status updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
