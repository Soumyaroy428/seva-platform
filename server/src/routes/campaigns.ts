import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getCampaigns() });
});

// Get "Support an Active Campaign" section settings & visibility
router.get('/section-settings', (req: Request, res: Response) => {
  try {
    const settings = serverStore.getCampaignSectionSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update "Support an Active Campaign" section settings & visibility
router.post('/section-settings', async (req: Request, res: Response) => {
  try {
    const { isEnabled, badgeText, heading, subheading, minDonationText, reviewer } = req.body;
    const updated = await serverStore.updateCampaignSectionSettings({
      ...(isEnabled !== undefined && { isEnabled: Boolean(isEnabled) }),
      ...(badgeText !== undefined && { badgeText }),
      ...(heading !== undefined && { heading }),
      ...(subheading !== undefined && { subheading }),
      ...(minDonationText !== undefined && { minDonationText })
    }, reviewer || 'System Admin');
    res.json({ success: true, message: 'Campaign section settings updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear all campaigns (Admin action: auto-hides section from main website)
router.post('/clear-all', async (req: Request, res: Response) => {
  try {
    const reviewer = (req.body?.reviewer as string) || 'System Admin';
    await serverStore.clearAllCampaigns(reviewer);
    res.json({ success: true, message: 'All campaigns cleared successfully. Section will be removed from main website.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load default 4 sample campaigns (Admin action: restores baseline campaigns)
router.post('/load-sample', async (req: Request, res: Response) => {
  try {
    const reviewer = (req.body?.reviewer as string) || 'System Admin';
    const loaded = await serverStore.loadSampleCampaigns(reviewer);
    res.json({ success: true, message: 'Sample campaigns restored successfully.', data: loaded });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { title, targetAmount, coverImage, description, location, isEmergency } = req.body;
    if (!title || !targetAmount || !coverImage) {
      return res.status(400).json({ success: false, error: 'Title, target amount, and cover image are required.' });
    }
    const newCamp = serverStore.createCampaign({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      targetAmount: Number(targetAmount),
      coverImage,
      description: description || '',
      location: location || 'General Area',
      isEmergency: Boolean(isEmergency),
      status: 'Active',
      category: 'Food Relief'
    });
    res.status(201).json({ success: true, data: newCamp });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = serverStore.updateCampaign(req.params.id as string, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = serverStore.deleteCampaign(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
