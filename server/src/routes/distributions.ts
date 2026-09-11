import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

// GET all ground distributions
router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getDistributions() });
});

// GET section settings (Recent Ground Distributions)
router.get('/section-settings', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getDistributionSectionSettings() });
});

// POST update section settings (Recent Ground Distributions)
router.post('/section-settings', async (req: Request, res: Response) => {
  try {
    const updated = await serverStore.updateDistributionSectionSettings(req.body, (req as any).user?.name || 'System Admin');
    res.json({
      success: true,
      message: 'Distribution section settings updated successfully',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST clear all ground distributions (Admin test for div removal)
router.post('/clear-all', async (req: Request, res: Response) => {
  try {
    await serverStore.clearAllDistributions((req as any).user?.name || 'System Admin');
    res.json({
      success: true,
      message: 'All ground distribution events cleared successfully. Section will be removed from main website.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST load default sample ground distributions
router.post('/load-sample', async (req: Request, res: Response) => {
  try {
    const sampleDists = await serverStore.loadSampleDistributions((req as any).user?.name || 'System Admin');
    res.json({
      success: true,
      message: 'Sample ground distributions restored successfully.',
      data: sampleDists
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create a ground distribution event
router.post('/', (req: Request, res: Response) => {
  try {
    const { campaignTitle, location, date, volunteersAssigned, mealsDistributed, beneficiariesCount, foodSource, proofPhotos, notes, status } = req.body;
    if (!campaignTitle || !location || !mealsDistributed) {
      return res.status(400).json({ success: false, error: 'Campaign title, location, and meals distributed are required.' });
    }
    const dist = serverStore.createDistribution({
      campaignTitle,
      location,
      date: date || new Date().toISOString().split('T')[0],
      volunteersAssigned: Array.isArray(volunteersAssigned) ? volunteersAssigned : (typeof volunteersAssigned === 'string' ? volunteersAssigned.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Field Team']),
      mealsDistributed: Number(mealsDistributed),
      beneficiariesCount: Number(beneficiariesCount) || Math.floor(Number(mealsDistributed) / 3),
      foodSource: foodSource || 'Seva Relief Kitchen',
      proofPhotos: Array.isArray(proofPhotos) && proofPhotos.length > 0
        ? proofPhotos
        : (typeof proofPhotos === 'string' && proofPhotos.trim() !== ''
          ? proofPhotos.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : ['https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop']),
      status: status || 'Verified',
      notes
    }, (req as any).user?.name || 'System Admin');

    res.status(201).json({
      success: true,
      message: 'Distribution event recorded with photographic proof.',
      data: dist
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update an existing distribution event
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const updated = serverStore.updateDistribution(id, req.body, (req as any).user?.name || 'System Admin');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Distribution event not found.' });
    }
    res.json({
      success: true,
      message: 'Distribution event updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE remove a distribution event
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const success = serverStore.deleteDistribution(id, (req as any).user?.name || 'System Admin');
    if (!success) {
      return res.status(404).json({ success: false, error: 'Distribution event not found.' });
    }
    res.json({
      success: true,
      message: 'Distribution event removed successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
