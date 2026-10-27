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
    const response = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject: `SEVA Platform — Your Verification Code: ${code}`,
      html
    });
    if (response.error) {
      console.error(`❌ [Resend] API rejected OTP email to ${to}:`, response.error);
      return { success: false, error: response.error.message || 'Resend rejected email dispatch' };
    }
    console.log(`✅ [Resend] Dispatched OTP email to ${to} (Message ID: ${response.data?.id})`);
    return { success: true, messageId: response.data?.id };
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



/**
 * 4. Dispatch SMS Notification (Configurable Provider with Safe Mock Fallback)
 */
export async function sendSmsNotification({
  toPhone,
  message,
  type = 'GENERAL'
}: {
  toPhone?: string;
  message: string;
  type?: 'DONATION_SUCCESS' | 'DONATION_PENDING' | 'DONATION_FAILED' | 'GENERAL';
}): Promise<{ success: boolean; mocked?: boolean; error?: string }> {
  if (!toPhone || toPhone.trim() === '') {
    return { success: false, error: 'No phone number provided' };
  }

  const cleanPhone = toPhone.trim().replace(/[^\d+]/g, '');

  // Fast2SMS integration if FAST2SMS_API_KEY is configured
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && fast2SmsKey.trim() !== '') {
    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone.replace(/^\+91/, '')
        })
      });
      const data: any = await res.json();
      console.log(`📱 [Fast2SMS] Dispatched ${type} SMS to ${cleanPhone}:`, data?.message || 'Delivered');
      return { success: true };
    } catch (err: any) {
      console.warn(`⚠️ [Fast2SMS Error] Failed to send SMS to ${cleanPhone}:`, err.message);
    }
  }

  // Fallback: Safe Mock Logging (Never throws in dev/sandbox)
  console.log(`📱 [SMS Gateway - ${type}] To: ${cleanPhone}\n   Content: "${message}"`);
  return { success: true, mocked: true };
}

/**
 * 5. Dispatch Donation Awaiting Verification Notification (Email & SMS)
 */
export async function sendDonationPendingNotification({
  toEmail,
  toPhone,
  donation
}: {
  toEmail: string;
  toPhone?: string;
  donation: {
    donationId: string;
    donorName: string;
    amount: number;
    campaignTitle: string;
  };
}): Promise<ISendEmailResult> {
  const resend = getResendClient();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #d97706; padding: 28px 24px; color: #ffffff; text-align: center; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 12px; background: #fef3c7; color: #92400e; }
          .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 22px;">SEVA FOUNDATION</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Payment Submission Received</p>
          </div>
          <div class="content">
            <p>Namaste <strong>${donation.donorName}</strong>,</p>
            <p>Thank you for submitting your donation of <strong>₹${donation.amount.toLocaleString('en-IN')}</strong> to SEVA.</p>
            
            <div style="text-align: center; margin: 16px 0;">
              <span class="badge">STATUS: AWAITING BANK RECONCILIATION</span>
            </div>

            <div class="details">
              <p style="margin: 4px 0;"><strong>Donation ID:</strong> ${donation.donationId}</p>
              <p style="margin: 4px 0;"><strong>Supported Campaign:</strong> ${donation.campaignTitle}</p>
              <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${donation.amount.toLocaleString('en-IN')}</p>
            </div>

            <p style="font-size: 13px; color: #475569;">
              Your manual UPI payment is currently undergoing verification against our official bank statement by our authorized Admin team. As soon as the transaction is confirmed, your official 80G tax receipt will be generated and emailed to you.
            </p>
          </div>
          <div class="footer">
            SEVA Foundation • Toll-Free Helpline: +91 1800-SEVA-AID
          </div>
        </div>
      </body>
    </html>
  `;

  // Dispatch SMS if phone is provided
  if (toPhone) {
    sendSmsNotification({
      toPhone,
      message: `Thank you for donating ₹${donation.amount} to Seva. Your payment submission is awaiting verification. Donation ID: ${donation.donationId}. We will notify you when the status is updated.`,
      type: 'DONATION_PENDING'
    }).catch(err => console.warn('Pending SMS warning:', err));
  }

  if (!resend) {
    console.log(`ℹ️ [Resend Mock Mode] Pending email to "${toEmail}": Donation = ${donation.donationId}`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject: `Your Seva Donation is Awaiting Verification [${donation.donationId}]`,
      html
    });
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`❌ [Resend] Failed to send pending email to ${toEmail}:`, err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/**
 * 6. Dispatch Donation Rejected / Failed Notification (Email & SMS)
 */
export async function sendDonationRejectedNotification({
  toEmail,
  toPhone,
  donation,
  rejectionReason
}: {
  toEmail: string;
  toPhone?: string;
  donation: {
    donationId: string;
    donorName: string;
    amount: number;
    campaignTitle: string;
    transactionId?: string;
  };
  rejectionReason: string;
}): Promise<ISendEmailResult> {
  const resend = getResendClient();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #b91c1c; padding: 28px 24px; color: #ffffff; text-align: center; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 12px; background: #fee2e2; color: #991b1b; }
          .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #991b1b; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 22px;">SEVA FOUNDATION</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Payment Verification Notice</p>
          </div>
          <div class="content">
            <p>Dear <strong>${donation.donorName}</strong>,</p>
            <p>Your Seva donation payment submission of <strong>₹${donation.amount.toLocaleString('en-IN')}</strong> could not be confirmed.</p>
            
            <div style="text-align: center; margin: 16px 0;">
              <span class="badge">STATUS: VERIFICATION REJECTED</span>
            </div>

            <div class="reason-box">
              <strong>Reviewer Note:</strong> ${rejectionReason}
            </div>

            <p style="font-size: 13px; color: #475569;">
              <strong>Donation ID:</strong> ${donation.donationId}<br>
              <strong>Transaction Reference:</strong> ${donation.transactionId || 'N/A'}<br>
              If money was deducted from your bank account, please contact our support desk immediately at <strong>support@seva.org</strong> or call our toll-free helpline with your bank UTR and account statement.
            </p>
          </div>
          <div class="footer">
            SEVA Foundation • Toll-Free Helpline: +91 1800-SEVA-AID
          </div>
        </div>
      </body>
    </html>
  `;

  // Dispatch SMS if phone is provided
  if (toPhone) {
    sendSmsNotification({
      toPhone,
      message: `Your Seva donation payment could not be confirmed. Donation ID: ${donation.donationId}. If money was deducted, please contact Seva support with your transaction reference.`,
      type: 'DONATION_FAILED'
    }).catch(err => console.warn('Rejected SMS warning:', err));
  }

  if (!resend) {
    console.log(`ℹ️ [Resend Mock Mode] Rejection email to "${toEmail}": Donation = ${donation.donationId}, Reason = ${rejectionReason}`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject: `Important: Your Seva Donation Payment Could Not Be Confirmed [${donation.donationId}]`,
      html
    });
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`❌ [Resend] Failed to send rejection email to ${toEmail}:`, err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/**
 * 8. Dispatch Monthly Donation Pledge Request Email with Embedded "Pay Now" Button
 */
export async function sendMonthlyDonationRequestEmail({
  to,
  recipientName,
  campaignTitle,
  campaignId,
  monthlyAmount,
  customMessage,
  senderName,
  senderRole,
  paymentUrl
}: {
  to: string;
  recipientName?: string;
  campaignTitle?: string;
  campaignId?: string;
  monthlyAmount: number;
  customMessage?: string;
  senderName?: string;
  senderRole?: 'Admin' | 'Volunteer' | string;
  paymentUrl: string;
}): Promise<ISendEmailResult> {
  const resend = getResendClient();
  const name = recipientName || 'Compassionate Supporter';
  const title = campaignTitle || 'Community Hunger Relief & Daily Kitchen Support';
  const meals = Math.max(1, Math.floor(monthlyAmount / 25));
  const senderDisplay = senderName ? `${senderName} (${senderRole || 'Volunteer'})` : 'The SEVA Humanitarian Team';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #ea580c 0%, #d97706 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
          .logo-text { font-size: 26px; font-weight: 900; letter-spacing: 1.5px; margin: 0; }
          .badge { display: inline-block; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.35); border-radius: 9999px; padding: 4px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 10px; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; }
          .appeal-card { background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%); border: 1px solid #fed7aa; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }
          .amount-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9a3412; letter-spacing: 1px; }
          .amount-val { font-size: 38px; font-weight: 900; color: #ea580c; margin: 6px 0; }
          .impact-pill { display: inline-block; background: #ea580c; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
          .impact-desc { font-size: 13px; color: #7c2d12; font-weight: 500; }
          .btn-container { text-align: center; margin: 30px 0 20px 0; }
          .pay-btn { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 16px; padding: 16px 40px; border-radius: 14px; box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35); text-align: center; letter-spacing: 0.5px; }
          .quote-box { background: #f8fafc; border-left: 4px solid #ea580c; padding: 14px 18px; border-radius: 0 12px 12px 0; margin: 20px 0; font-size: 13.5px; color: #334155; line-height: 1.6; font-style: italic; }
          .tax-note { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; margin-top: 24px; font-size: 12px; color: #065f46; line-height: 1.5; }
          .footer { background: #f8fafc; padding: 24px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">SEVA FOUNDATION</h1>
            <div class="badge">Official Monthly Hunger Relief Appeal</div>
          </div>
          <div class="content">
            <p style="font-size: 15px;">Namaste <strong>${name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              As part of our continuous hunger relief mission, we invite you to renew your compassionate commitment with a monthly contribution for <strong>${title}</strong>.
            </p>

            ${customMessage ? `
            <div class="quote-box">
              &ldquo;${customMessage}&rdquo;
              <div style="font-style: normal; font-weight: 700; font-size: 12px; color: #ea580c; margin-top: 8px;">— ${senderDisplay}</div>
            </div>` : ''}

            <div class="appeal-card">
              <div class="amount-label">Suggested Monthly Support</div>
              <div class="amount-val">₹${monthlyAmount.toLocaleString('en-IN')}</div>
              <div class="impact-pill">🍲 Feeds ~${meals} Wholesome Meals</div>
              <div class="impact-desc">Your monthly gift ensures our community kitchen never runs out of rations for hungry children, daily wage earners, and elderly individuals.</div>
            </div>

            <!-- Prominent Pay Now Button -->
            <div class="btn-container">
              <a href="${paymentUrl}" class="pay-btn" target="_blank">
                👉 Click Here to Pay ₹${monthlyAmount} Now
              </a>
            </div>

            <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 10px;">
              Direct NPCI UPI, PhonePe, GPay, Paytm & Instant 80G Tax Receipt.
            </p>

            <div class="tax-note">
              <strong>100% Tax Exemption Under Section 80G:</strong><br>
              Every rupee donated is eligible for 50% tax deduction under Section 80G of the Indian Income Tax Act. An official signed tax certificate is dispatched immediately to your email upon payment.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SEVA Foundation • Trust Reg: SEVA/WB/2026/80G<br>
            Toll-Free Helpline: +91 1800-SEVA-AID • Kolkata, West Bengal<br>
            You are receiving this invitation as a registered supporter of the SEVA humanitarian network.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`ℹ️ [Resend Mock Mode] Monthly Donation Request to "${to}": Amount = ₹${monthlyAmount}, Campaign = "${title}", Pay URL = ${paymentUrl}`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject: `Monthly Hunger Relief Appeal — Support ${title} [₹${monthlyAmount}/month]`,
      html
    });
    console.log(`✅ [Resend] Dispatched Monthly Donation Request to ${to} (Message ID: ${data.data?.id})`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error(`❌ [Resend] Failed to send monthly donation request to ${to}:`, err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}
