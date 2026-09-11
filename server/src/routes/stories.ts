import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getStories() });
});

// GET section settings (MUST be before /:id)
router.get('/section-settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: serverStore.getStorySectionSettings()
  });
});

// POST update section settings
router.post('/section-settings', async (req: Request, res: Response) => {
  try {
    const updated = await serverStore.updateStorySectionSettings(req.body, (req as any).user?.name || 'System Admin');
    res.json({
      success: true,
      message: 'Story section settings updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST clear all stories (Triggers complete DOM removal on main site)
router.post('/clear-all', (req: Request, res: Response) => {
  try {
    serverStore.clearAllStories((req as any).user?.name || 'System Admin');
    res.json({
      success: true,
      message: 'All stories cleared. The Stories / Blogs section will be completely removed from the main website.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST load default sample stories
router.post('/load-sample', (req: Request, res: Response) => {
  try {
    const sample = serverStore.loadSampleStories((req as any).user?.name || 'System Admin');
    res.json({
      success: true,
      message: 'Sample success stories restored successfully.',
      data: sample
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new story / blog post (Admin)
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, summary, impactText, beneficiaryName, location, image, date } = req.body;
    if (!title || !summary) {
      return res.status(400).json({ success: false, error: 'Title and summary are required.' });
    }

    const story = serverStore.createStory({
      title,
      summary,
      impactText,
      beneficiaryName,
      location,
      image,
      date
    });

    res.status(201).json({
      success: true,
      message: 'Success story published successfully.',
      data: story
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update story / blog post (Admin)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = serverStore.updateStory(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Story not found.' });
    }

    res.json({
      success: true,
      message: 'Story updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete story / blog post (Admin)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const ok = serverStore.deleteStory(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Story not found.' });
    }

    res.json({
      success: true,
      message: 'Story removed successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
