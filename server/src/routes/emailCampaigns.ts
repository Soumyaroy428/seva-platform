import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { serverStore } from '../services/store';
import { UserModel, DonationModel } from '../models';
import { sendMonthlyDonationRequestEmail } from '../services/email';

const router = Router();

export interface IEmailRecipient {
  email: string;
  name: string;
  role: string;
  totalDonated: number;
  donationCount: number;
  lastActive: string;
  phone?: string;
}

/**
 * 1. GET /api/email-campaigns/recipients
 * List all unique registered users, past donors, and supporters
 */
router.get('/recipients', async (_req: Request, res: Response) => {
  try {
    const recipientMap = new Map<string, IEmailRecipient>();

    // 1. Ensure env accounts initialized and fetch in-memory store users & past donations
    serverStore.initEnvAccounts();
    const storeUsers = serverStore.getUsers() || [];
    const storeDonations = serverStore.getDonations() || [];

    for (const u of storeUsers) {
      if (u.email && u.email.includes('@')) {
        const cleanEmail = u.email.trim().toLowerCase();
        recipientMap.set(cleanEmail, {
          email: cleanEmail,
          name: u.name || 'Supporter',
          role: u.role || 'user',
          totalDonated: 0,
          donationCount: 0,
          lastActive: u.createdAt || new Date().toISOString(),
          phone: u.phone
        });
      }
    }

    for (const d of storeDonations) {
      if (d.donorEmail && d.donorEmail.includes('@')) {
        const cleanEmail = d.donorEmail.trim().toLowerCase();
        const existing = recipientMap.get(cleanEmail);
        const amount = Number(d.amount) || 0;
        const isSuccess = d.status === 'Successful' || d.status === 'SUCCESS' || d.status === 'Verified';

        if (existing) {
          if (isSuccess) {
            existing.totalDonated += amount;
            existing.donationCount += 1;
          }
          if (d.donorName && existing.name === 'Supporter') {
            existing.name = d.donorName;
          }
        } else {
          recipientMap.set(cleanEmail, {
            email: cleanEmail,
            name: d.donorName || 'Generous Donor',
            role: 'donor',
            totalDonated: isSuccess ? amount : 0,
            donationCount: isSuccess ? 1 : 0,
            lastActive: d.createdAt || new Date().toISOString(),
            phone: d.donorPhone
          });
        }
      }
    }

    // 2. Query MongoDB Atlas if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const dbUsers: any[] = await UserModel.find({}).lean();
        for (const u of dbUsers) {
          if (u.email && u.email.includes('@')) {
            const cleanEmail = u.email.trim().toLowerCase();
            const existing = recipientMap.get(cleanEmail);
            if (!existing) {
              recipientMap.set(cleanEmail, {
                email: cleanEmail,
                name: u.name || 'Supporter',
                role: u.role || 'user',
                totalDonated: 0,
                donationCount: 0,
                lastActive: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
                phone: u.phone
              });
            } else if (u.name && existing.name === 'Supporter') {
              existing.name = u.name;
            }
          }
        }

        const dbDonations: any[] = await DonationModel.find({}).lean();
        for (const d of dbDonations) {
          if (d.donorEmail && d.donorEmail.includes('@')) {
            const cleanEmail = d.donorEmail.trim().toLowerCase();
            const existing = recipientMap.get(cleanEmail);
            const amount = Number(d.amount) || 0;
            const isSuccess = d.status === 'Successful' || d.status === 'SUCCESS' || d.status === 'Verified';

            if (existing) {
              if (isSuccess && existing.donationCount === 0) {
                existing.totalDonated += amount;
                existing.donationCount += 1;
              }
              if (d.donorName && (!existing.name || existing.name === 'Supporter')) {
                existing.name = d.donorName;
              }
            } else {
              recipientMap.set(cleanEmail, {
                email: cleanEmail,
                name: d.donorName || 'Generous Donor',
                role: 'donor',
                totalDonated: isSuccess ? amount : 0,
                donationCount: isSuccess ? 1 : 0,
                lastActive: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
                phone: d.donorPhone
              });
            }
          }
        }
      } catch (dbErr: any) {
        console.warn('Recipients DB fetch non-fatal notice:', dbErr.message);
      }
    }

    const recipients = Array.from(recipientMap.values()).sort((a, b) => {
      // Sort donors first, then by total donations descending
      if (b.totalDonated !== a.totalDonated) return b.totalDonated - a.totalDonated;
      return a.name.localeCompare(b.name);
    });

    return res.json({
      success: true,
      count: recipients.length,
      data: recipients
    });
  } catch (err: any) {
    console.error('Error fetching email recipients:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch email recipients.' });
  }
});

/**
 * 2. POST /api/email-campaigns/send-monthly-request
 * Dispatch monthly donation appeal email with "Pay Now" button to selected recipients
 */
router.post('/send-monthly-request', async (req: Request, res: Response) => {
  try {
    const {
      recipients, // array of emails or string email
      campaignTitle,
      campaignId,
      monthlyAmount,
      customMessage,
      senderName,
      senderRole
    } = req.body;

    // Validation
    const rawRecipients: string[] = Array.isArray(recipients) 
      ? recipients 
      : (typeof recipients === 'string' && recipients.trim() ? [recipients.trim()] : []);

    const targetEmails = Array.from(
      new Set(
        rawRecipients
          .map(e => e.trim().toLowerCase())
          .filter(e => e.includes('@') && e.length > 5)
      )
    );

    if (targetEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one registered recipient email to send the request.'
      });
    }

    const parsedAmount = Math.max(20, Number(monthlyAmount) || 100);
    const activeCampaignTitle = campaignTitle || 'General Community Hunger Relief';
    const activeCampaignId = campaignId || 'CMP-1';

    // Resolve app platform base URL
    const appUrl = (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://seva-platform-pink.vercel.app')
    ).replace(/\/+$/, '');

    // Map existing recipient names for personalized greetings
    const storeUsers = serverStore.getUsers() || [];
    const storeDonations = serverStore.getDonations() || [];
    const nameMap = new Map<string, string>();

    storeUsers.forEach(u => {
      if (u.email && u.name) nameMap.set(u.email.trim().toLowerCase(), u.name);
    });
    storeDonations.forEach(d => {
      if (d.donorEmail && d.donorName) nameMap.set(d.donorEmail.trim().toLowerCase(), d.donorName);
    });

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Dispatch emails to all target recipients
    for (const email of targetEmails) {
      const recipientName = nameMap.get(email) || 'Supporter';
      
      // Personal Pay Now deep-link for instant prefilled checkout
      const paymentUrl = `${appUrl}/?donate=true&amount=${parsedAmount}&campaign=${encodeURIComponent(activeCampaignId)}&email=${encodeURIComponent(email)}&utm_source=monthly_email`;

      try {
        const result = await sendMonthlyDonationRequestEmail({
          to: email,
          recipientName,
          campaignTitle: activeCampaignTitle,
          campaignId: activeCampaignId,
          monthlyAmount: parsedAmount,
          customMessage: customMessage ? String(customMessage).trim() : undefined,
          senderName: senderName || 'Field Volunteer Team',
          senderRole: senderRole || 'Volunteer',
          paymentUrl
        });

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (result.error) errors.push(`${email}: ${result.error}`);
        }
      } catch (dispatchErr: any) {
        failureCount++;
        errors.push(`${email}: ${dispatchErr.message}`);
      }
    }

    // Audit log
    serverStore.logAudit(
      senderName || 'Volunteer',
      'EMAIL_CAMPAIGN_DISPATCHED',
      'Communication',
      `Dispatched monthly donation appeal (₹${parsedAmount}/mo for ${activeCampaignTitle}) to ${successCount} recipients. Success: ${successCount}, Failures: ${failureCount}.`
    );

    return res.json({
      success: true,
      message: `Monthly donation requests dispatched to ${successCount} recipient${successCount === 1 ? '' : 's'}.`,
      sentCount: successCount,
      failedCount: failureCount,
      totalRequested: targetEmails.length,
      errors: errors.slice(0, 5)
    });
  } catch (err: any) {
    console.error('Error dispatching monthly donation requests:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch monthly donation request emails.'
    });
  }
});

export default router;
