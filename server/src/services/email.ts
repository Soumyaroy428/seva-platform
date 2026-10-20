import { Resend } from 'resend';

// Initialize Resend client if API key is present
const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey.trim());
};

const getFromEmail = (): string => {
  return process.env.RESEND_FROM_EMAIL || 'SEVA Platform <onboarding@resend.dev>';
};

export interface ISendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mocked?: boolean;
}

/**
 * 1. Dispatch 6-Digit OTP Verification Email
 */
export async function sendOtpEmail({
  to,
  name,
  code,
  intent = 'login'
}: {
  to: string;
  name?: string;
  code: string;
  intent?: 'login' | 'register';
}): Promise<ISendEmailResult> {
  const resend = getResendClient();
  const recipientName = name || 'Supporter';
  const actionText = intent === 'register' ? 'account registration' : 'secure login';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #ea580c 0%, #d97706 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .logo-text { font-size: 24px; font-weight: 900; letter-spacing: 1px; margin: 0; }
          .tagline { font-size: 13px; opacity: 0.9; margin-top: 6px; }
          .content { padding: 32px 24px; }
          .otp-box { background: #fff7ed; border: 2px dashed #f97316; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #ea580c; }
          .expiry { font-size: 12px; color: #64748b; margin-top: 8px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">SEVA FOUNDATION</h1>
            <p class="tagline">Your Contribution. Someone's Meal. Someone's Hope.</p>
          </div>
          <div class="content">
            <p>Namaste <strong>${recipientName}</strong>,</p>
            <p>Your 6-digit one-time verification code for ${actionText} is:</p>
            
            <div class="otp-box">
              <div class="otp-code">${code}</div>
              <div class="expiry">This code is valid for 10 minutes. Do not share it with anyone.</div>
            </div>

            <p style="font-size: 13px; color: #64748b;">If you did not request this verification code, please ignore this email or contact support at support@seva.org.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SEVA Foundation • Reg. Trust No: SEVA/WB/2026/80G<br>
            Official 100% Traceable Community Aid & Relief Network
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`ℹ️ [Resend Mock Mode] OTP email to "${to}": Code = ${code} (Intent: ${intent})`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject: `SEVA Platform — Your Verification Code: ${code}`,
      html
    });
    console.log(`✅ [Resend] Dispatched OTP email to ${to} (Message ID: ${data.data?.id})`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`❌ [Resend] Failed to send OTP email to ${to}:`, err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/**
 * 2. Dispatch Official 80G Donation Receipt Email
 */
export async function sendDonationReceiptEmail({
  to,
  donation
}: {
  to: string;
  donation: {
    donationId: string;
    donorName: string;
    amount: number;
    campaignTitle: string;
    paymentMethod: string;
    transactionId?: string;
    createdAt?: string;
  };
}): Promise<ISendEmailResult> {
  const resend = getResendClient();
  const mealsSupported = Math.max(1, Math.floor(donation.amount / 25));
  const dateFormatted = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 24px; color: #ffffff; text-align: center; }
          .logo-text { font-size: 24px; font-weight: 900; letter-spacing: 1px; margin: 0; }
          .badge-80g { display: inline-block; background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.4); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
          .content { padding: 32px 24px; }
          .receipt-hero { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: 900; color: #ea580c; }
          .meals { font-size: 13px; color: #9a3412; font-weight: 600; margin-top: 4px; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
          .details-table td.label { color: #64748b; font-weight: 600; width: 40%; }
          .details-table td.value { font-weight: 700; color: #0f172a; }
          .tax-note { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-top: 24px; font-size: 12px; color: #065f46; line-height: 1.5; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">SEVA FOUNDATION</h1>
            <div class="badge-80g">Official Verified 80G Tax Exemption Receipt</div>
          </div>
          <div class="content">
            <p>Dear <strong>${donation.donorName}</strong>,</p>
            <p>Thank you for your generous contribution towards hunger relief. Your support delivers warm, wholesome meals directly to vulnerable families on the ground.</p>

            <div class="receipt-hero">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9a3412; letter-spacing: 0.5px;">Contribution Received</div>
              <div class="amount">₹${donation.amount.toLocaleString('en-IN')}</div>
              <div class="meals">Supports approximately ${mealsSupported} freshly prepared wholesome meals</div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">Receipt Number</td>
                <td class="value">${donation.donationId}</td>
              </tr>
              <tr>
                <td class="label">Date of Contribution</td>
                <td class="value">${dateFormatted}</td>
              </tr>
              <tr>
                <td class="label">Supported Initiative</td>
                <td class="value">${donation.campaignTitle}</td>
              </tr>
              <tr>
                <td class="label">Payment Mode</td>
                <td class="value">${donation.paymentMethod}</td>
              </tr>
              ${donation.transactionId ? `
              <tr>
                <td class="label">Transaction Reference</td>
                <td class="value" style="font-family: monospace;">${donation.transactionId}</td>
              </tr>` : ''}
            </table>

            <div class="tax-note">
              <strong>Section 80G Tax Exemption Certificate:</strong><br>
              This official receipt entitles the donor to tax deduction benefits under Section 80G of the Income Tax Act, 1961.<br>
              <strong>Trust Registration:</strong> SEVA/WB/2026/80G • <strong>Pan Number:</strong> AABTS9902K
            </div>
          </div>
          <div class="footer">
            SEVA Foundation • 12 Hunger Relief Way, Sector 5, Salt Lake, Kolkata, WB 700091<br>
            Toll-Free Helpline: +91 1800-SEVA-AID • www.seva-humanitarian.org
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`ℹ️ [Resend Mock Mode] 80G Tax Receipt email to "${to}": Amount = ₹${donation.amount} (Receipt: ${donation.donationId})`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject: `Official 80G Donation Receipt [${donation.donationId}] — SEVA Foundation`,
      html
    });
    console.log(`✅ [Resend] Dispatched 80G Receipt to ${to} (Message ID: ${data.data?.id})`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`❌ [Resend] Failed to send 80G receipt to ${to}:`, err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/**
 * 3. Dispatch Volunteer Status Update Email (Approval / Status Change)
 */
export async function sendVolunteerStatusEmail({
  to,
  name,
  status,
  volunteerId
}: {
  to: string;
  name: string;
  status: string;
  volunteerId?: string;
}): Promise<ISendEmailResult> {
  const resend = getResendClient();
  const isApproved = status === 'Approved';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: ${isApproved ? '#059669' : '#1e293b'}; padding: 28px 24px; color: #ffffff; text-align: center; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 12px; background: ${isApproved ? '#ecfdf5' : '#fef2f2'}; color: ${isApproved ? '#065f46' : '#991b1b'}; }
          .id-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 18px; font-weight: 700; color: #0f172a; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 22px;">SEVA VOLUNTEER OPERATIONS</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Field Credential & Operations Desk</p>
          </div>
          <div class="content">
            <p>Namaste <strong>${name}</strong>,</p>
            <p>Your volunteer application status has been updated by the Governance Committee:</p>
            <div style="text-align: center; margin: 16px 0;">
              <span class="badge">STATUS: ${status.toUpperCase()}</span>
            </div>

            ${volunteerId ? `
            <div class="id-box">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-family: sans-serif; margin-bottom: 4px;">Digital Volunteer ID</div>
              ${volunteerId}
            </div>` : ''}

            ${isApproved ? `
            <p><strong>Next Steps:</strong> You are now authorized to access the <a href="http://localhost:3000/volunteer">Volunteer Operations Hub</a>, log hand cash donations, verify ground field dispatches, and generate your live Digital ID badge.</p>
            ` : `
            <p>If you have any questions regarding your application review, please contact the Volunteer Coordinator desk.</p>
            `}
          </div>
          <div class="footer">
            SEVA Foundation • Verified Community Aid & Volunteer Services
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`ℹ️ [Resend Mock Mode] Volunteer status email to "${to}": Status = ${status} (ID: ${volunteerId})`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject: `SEVA Volunteer Application Update: ${status}`,
      html
    });
    console.log(`✅ [Resend] Dispatched volunteer status update to ${to} (Message ID: ${data.data?.id})`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`❌ [Resend] Failed to send volunteer status email to ${to}:`, err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

