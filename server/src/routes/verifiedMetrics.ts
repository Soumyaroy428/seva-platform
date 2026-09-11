import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

// Public / Client: Fetch Real-Time Verified Metrics
router.get('/', (req: Request, res: Response) => {
  try {
    const metrics = serverStore.getVerifiedMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Save or Update Real-Time Verified Metrics
// Note: If admin does not write any number (or leaves field blank/null/undefined), it defaults strictly to 0
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      totalMealsServed,
      totalPeopleHelped,
      activeVolunteersCount,
      totalDistributionsCount,
      totalDonated,
      badgeText,
      heading,
      subheading,
      mealsLabel,
      mealsSublabel,
      peopleLabel,
      peopleSublabel,
      volunteersLabel,
      volunteersSublabel,
      distributionsLabel,
      distributionsSublabel,
      donatedLabel,
      donatedSublabel,
      reviewer
    } = req.body;

    const parseVal = (val: any): number => {
      if (val === undefined || val === null || val === '' || isNaN(Number(val))) {
        return 0;
      }
      const num = Number(val);
      return num < 0 ? 0 : num;
    };

    const updated = await serverStore.updateVerifiedMetrics({
      totalMealsServed: parseVal(totalMealsServed),
      totalPeopleHelped: parseVal(totalPeopleHelped),
      activeVolunteersCount: parseVal(activeVolunteersCount),
      totalDistributionsCount: parseVal(totalDistributionsCount),
      totalDonated: parseVal(totalDonated),
      ...(badgeText !== undefined && { badgeText }),
      ...(heading !== undefined && { heading }),
      ...(subheading !== undefined && { subheading }),
      ...(mealsLabel !== undefined && { mealsLabel }),
      ...(mealsSublabel !== undefined && { mealsSublabel }),
      ...(peopleLabel !== undefined && { peopleLabel }),
      ...(peopleSublabel !== undefined && { peopleSublabel }),
      ...(volunteersLabel !== undefined && { volunteersLabel }),
      ...(volunteersSublabel !== undefined && { volunteersSublabel }),
      ...(distributionsLabel !== undefined && { distributionsLabel }),
      ...(distributionsSublabel !== undefined && { distributionsSublabel }),
      ...(donatedLabel !== undefined && { donatedLabel }),
      ...(donatedSublabel !== undefined && { donatedSublabel })
    }, reviewer || 'System Admin');

    res.json({
      success: true,
      message: 'Real-Time Verified Metrics updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Reset all Verified Metrics to 0
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const reviewer = (req.body?.reviewer as string) || 'System Admin';
    const reset = await serverStore.resetVerifiedMetrics(reviewer);
    res.json({
      success: true,
      message: 'Real-Time Verified Metrics reset to 0 successfully.',
      data: reset
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
