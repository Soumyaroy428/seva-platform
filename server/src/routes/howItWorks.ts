import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getHowItWorks() });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { number, title, desc, badge } = req.body;
    if (!title || !desc) {
      return res.status(400).json({ success: false, error: 'Title and description are required.' });
    }
    const stepCount = serverStore.getHowItWorks().length;
    const stepNum = number || (stepCount + 1 < 10 ? `0${stepCount + 1}` : `${stepCount + 1}`);

    const newStep = serverStore.createHowItWorksStep({
      number: stepNum,
      title,
      desc,
      badge: badge || 'Digitally Verified'
    });

    res.status(201).json({ success: true, message: 'Step added successfully', data: newStep });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = serverStore.updateHowItWorksStep(req.params.id as string, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Step not found' });
    }
    res.json({ success: true, message: 'Step updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = serverStore.deleteHowItWorksStep(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Step not found' });
    }
    res.json({ success: true, message: 'Step deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
