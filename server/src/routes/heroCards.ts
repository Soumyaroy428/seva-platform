import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

// Public: Fetch Right Hero Visual Cards
router.get('/', (req: Request, res: Response) => {
  try {
    const heroCard = serverStore.getRightHeroCard();
    res.json({
      success: true,
      data: heroCard
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Save or Update Right Hero Visual Cards
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      badgeText,
      timeAgo,
      imageUrl,
      raisedAmount,
      goalAmount,
      progressPercentage,
      impactCardTag,
      impactCardText,
      impactCardIcon,
      showImpactCard,
      volunteerCardTag,
      volunteerCardText,
      volunteerCardIcon,
      showVolunteerCard,
      isActive,
      reviewer
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required for Right Hero Visual Cards.'
      });
    }

    const saved = await serverStore.saveRightHeroCard({
      title: title.trim(),
      badgeText: badgeText || 'Live Field Dispatch',
      timeAgo: timeAgo || '12 mins ago',
      imageUrl: imageUrl || '',
      raisedAmount: Number(raisedAmount) || 0,
      goalAmount: Number(goalAmount) || 0,
      progressPercentage: Number(progressPercentage) || 0,
      impactCardTag: impactCardTag || 'Direct Impact',
      impactCardText: impactCardText || '₹20 = 1 Nourishing Meal',
      impactCardIcon: impactCardIcon || '✓',
      showImpactCard: showImpactCard !== false,
      volunteerCardTag: volunteerCardTag || 'Volunteers',
      volunteerCardText: volunteerCardText || '840+ Active on Field',
      volunteerCardIcon: volunteerCardIcon || '★',
      showVolunteerCard: showVolunteerCard !== false,
      isActive: isActive !== false
    }, reviewer || 'System Admin');

    res.json({
      success: true,
      message: 'Right Hero Visual Cards saved successfully to database.',
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Clear / Remove Right Hero Visual Cards (Nothing written state)
router.delete('/', async (req: Request, res: Response) => {
  try {
    const reviewer = (req.query.reviewer as string) || (req.body?.reviewer as string) || 'System Admin';
    await serverStore.deleteRightHeroCard(reviewer);
    res.json({
      success: true,
      message: 'Right Hero Visual Cards cleared successfully from database.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
