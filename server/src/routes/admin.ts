import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
  const stats = serverStore.getGlobalStats();
  const qrs = serverStore.getPaymentQRs();
  const pendingQRs = qrs.filter(q => q.status === 'Pending').length;
  const volunteers = serverStore.getVolunteers();
  const pendingVolunteers = volunteers.filter(v => v.status === 'Pending').length;
  const recentDonations = serverStore.getDonations().slice(0, 5);
  const recentAudits = serverStore.getAuditLogs().slice(0, 8);

  res.json({
    success: true,
    data: {
      stats,
      pendingQRs,
      pendingVolunteers,
      recentDonations,
      recentAudits
    }
  });
});

router.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, data: serverStore.getAuditLogs() });
});

// Get platform settings and impact counters
router.get('/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: serverStore.getSettings()
  });
});

// Update platform settings and impact counters (Admin control)
router.post('/settings', (req: Request, res: Response) => {
  try {
    const {
      siteTitle,
      tagline,
      helplinePhone,
      minDonationINR,
      emergencyBannerEnabled,
      emergencyBannerBadge,
      emergencyBannerText,
      trustTagline,
      bannerTheme,
      totalMealsOffset,
      totalPeopleOffset,
      activeVolunteersOffset,
      targetDonationGoal,
      reviewer
    } = req.body;

    const updated = serverStore.updateSettings({
      ...(siteTitle !== undefined && { siteTitle }),
      ...(tagline !== undefined && { tagline }),
      ...(helplinePhone !== undefined && { helplinePhone }),
      ...(minDonationINR !== undefined && { minDonationINR: Number(minDonationINR) }),
      ...(emergencyBannerEnabled !== undefined && { emergencyBannerEnabled: Boolean(emergencyBannerEnabled) }),
      ...(emergencyBannerBadge !== undefined && { emergencyBannerBadge }),
      ...(emergencyBannerText !== undefined && { emergencyBannerText }),
      ...(trustTagline !== undefined && { trustTagline }),
      ...(bannerTheme !== undefined && { bannerTheme }),
      ...(totalMealsOffset !== undefined && { totalMealsOffset: Number(totalMealsOffset) }),
      ...(totalPeopleOffset !== undefined && { totalPeopleOffset: Number(totalPeopleOffset) }),
      ...(activeVolunteersOffset !== undefined && { activeVolunteersOffset: Number(activeVolunteersOffset) }),
      ...(targetDonationGoal !== undefined && { targetDonationGoal: Number(targetDonationGoal) })
    }, reviewer || 'System Admin');

    res.json({
      success: true,
      message: 'Website controls and impact settings updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
