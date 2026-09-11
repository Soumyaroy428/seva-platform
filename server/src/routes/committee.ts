import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getCommittee() });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, designation, bio, responsibilities, photo } = req.body;
    if (!name || !designation) {
      return res.status(400).json({ success: false, error: 'Name and designation are required.' });
    }
    const newMember = serverStore.addCommitteeMember({
      name,
      designation,
      bio: bio || '',
      responsibilities: responsibilities || '',
      photo
    });
    res.status(201).json({ success: true, message: 'Committee member added successfully', data: newMember });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = serverStore.updateCommitteeMember(req.params.id as string, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Committee member not found' });
    }
    res.json({ success: true, message: 'Committee member updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = serverStore.deleteCommitteeMember(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Committee member not found' });
    }
    res.json({ success: true, message: 'Committee member removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
