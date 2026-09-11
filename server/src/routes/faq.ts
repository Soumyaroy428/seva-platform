import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getFAQs() });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { q, a, category } = req.body;
    if (!q || !a) {
      return res.status(400).json({ success: false, error: 'Question and answer are required.' });
    }

    const newFAQ = serverStore.createFAQ({
      q,
      a,
      category: category || 'General'
    });

    res.status(201).json({ success: true, message: 'FAQ created successfully', data: newFAQ });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = serverStore.updateFAQ(req.params.id as string, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = serverStore.deleteFAQ(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
