import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getVolunteers() });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, area, skills, availability } = req.body;
    if (!name || !email || !phone || !area) {
      return res.status(400).json({ success: false, error: 'Name, email, phone, and area are required.' });
    }
    const vol = serverStore.registerVolunteer({
      name,
      email,
      phone,
      area,
      skills: Array.isArray(skills) ? skills : ['General Logistics'],
      availability: availability || 'Weekends'
    });
    res.status(201).json({
      success: true,
      message: 'Volunteer registered. Digital ID generated.',
      data: vol
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/', (req: Request, res: Response) => {
  try {
    const { volunteerId, status, reviewer } = req.body;
    const ok = serverStore.updateVolunteerStatus(volunteerId, status, reviewer || 'Admin');
    if (!ok) return res.status(404).json({ success: false, error: 'Volunteer not found.' });
    res.json({ success: true, message: `Volunteer status changed to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const ok = serverStore.deleteVolunteer(req.params.id as string);
    if (!ok) return res.status(404).json({ success: false, error: 'Volunteer not found.' });
    res.json({ success: true, message: 'Volunteer removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
