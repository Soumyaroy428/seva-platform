import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getBeneficiaries() });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, familyHeadName, area, householdSize, category } = req.body;
    if (!name || !area) {
      return res.status(400).json({ success: false, error: 'Name and area are required.' });
    }
    const ben = serverStore.registerBeneficiary({
      name,
      familyHeadName: familyHeadName || name,
      area,
      householdSize: Number(householdSize) || 1,
      category: category || 'Daily Wage'
    });
    res.status(201).json({
      success: true,
      message: 'Beneficiary enrolled and QR pass generated.',
      data: ben
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
