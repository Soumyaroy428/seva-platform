# SEVA Platform — Administrator Operations Guide

> **Document Type:** Operational & Management Manual  
> **Target Audience:** System Administrators, Trust Officers, Field Coordinators  
> **Console Access URL:** `http://localhost:3000/admin`  
> **Source Component:** `client/src/app/admin/page.tsx` (5,900+ Lines)

---

## 1. Overview & Security Protocols

The **SEVA Administrator Console** provides real-time control over all public-facing content, financial flows, volunteer access, and anti-fraud pipelines.

### Security Highlights
- **Role Guard**: Requires an authenticated user with `role === 'admin'`. Unauthorized visitors are redirected to `/login?redirect=/admin`.
- **Capacity Quotas**: Enforces maximum administrative slots to prevent privilege escalation.
- **Audit Logging**: Every create, update, approve, reject, or delete action is permanently recorded in the immutable audit log with the acting admin's name and timestamp.

---

## 2. Navigating the 16 Management Tabs

The console is partitioned into 16 specialized control tabs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SEVA ADMIN CONTROL CONSOLE                      │
├──────────────┬──────────────────┬─────────────────┬────────────────────┤
│ 1. Overview  │ 5. Verified Metr.│ 9. Expenses     │ 13. Volunteers     │
│ 2. Campaigns │ 6. How It Works  │ 10. Committee   │ 14. Settings       │
│ 3. Hero Card │ 7. Food Rescue   │ 11. Stories     │ 15. Payment QRs    │
│ 4. Announce  │ 8. Distributions │ 12. FAQ         │ 16. Audit Logs     │
└──────────────┴──────────────────┴─────────────────┴────────────────────┘
```

---

### Tab 1: Overview
The centralized command center for monitoring operational health:
- **Global KPI Cards**: Live total donations collected, meals funded, active volunteers, and beneficiary headcounts.
- **Quota Visualizers**: Visual gauges displaying currently allocated admin and volunteer slots vs. platform ceilings.
- **Action Needed Callouts**: Highlights count of pending Payment QRs and pending Volunteer applications requiring immediate review.
- **Recent Activity Stream**: Live feed of incoming donations and field events.

---

### Tab 2: Campaigns
Full lifecycle management for humanitarian campaigns:
- **Create Campaign**: Input title, target amount in INR, high-resolution cover image URL, location, and emergency badge toggle.
- **Edit & Pause**: Temporarily pause fundraising or adjust target amounts.
- **Section Controls**:
  - Toggle the entire "Support an Active Campaign" section on or off the public homepage.
  - Customize badge text, heading, and subheading.
  - **Clear All**: Deletes all active campaigns to test the empty state.
  - **Load Sample**: Restores the 4 baseline sample campaigns with one click.

---

### Tab 3: Hero Cards
Dynamic CMS for the visual card rendered in the right column of the landing page hero section:
- Update main card headline and field photo URL.
- Configure progress goals: Set raised amount vs. goal amount (auto-calculates percentage).
- Toggle and customize the two floating impact badges (e.g. `Direct Impact: ₹20 = 1 Nourishing Meal` and `Volunteers: 840+ Active on Field`).
- Toggle card visibility or clear card entirely to test minimalist layout.

---

### Tab 4: Announcement Strip
Controls the sticky emergency banner at the top of every page:
- **Toggle Banner**: Enable or disable the notification strip.
- **Theme Color Switcher**: Choose from 5 themes:
  - *Orange* (Standard brand theme)
  - *Red / Rose* (Disaster / Emergency relief)
  - *Emerald* (Green / Successful milestone)
  - *Slate / Black* (Muted / Governance notice)
  - *Amber / Gold* (Festival / Special campaign)
- **Banner Copy**: Edit alert text, badge label (e.g., `Active Relief`), and 24/7 toll-free helpline number.

---

### Tab 5: Verified Metrics
Direct control over the real-time verified impact counters displayed on the landing page:
- Manually enter or sync totals for:
  - Total Meals Served
  - Total People Helped
  - Active Volunteers on Field
  - Total Distribution Drives
  - Total Donated (INR)
- **Strict Defaulting Rule**: If any field is left blank, empty, or undefined, it strictly defaults to `0`.
- **Reset to Zero Button**: Instantly zeroes all metrics for audit resets or fiscal year rollover.

---

### Tab 6: How It Works
Configures the 4-step verified workflow process on the homepage:
- Add, edit, or delete workflow steps.
- Customize step numbers (`01`, `02`, etc.), titles, descriptions, and verification badges (e.g., `Digitally Verified`, `Zero Wastage`).

---

### Tab 7: Food Rescue
Manages surplus food donations received from restaurants, caterers, and weddings:
- Inspect food type, prepared timestamp, and **safe consumption expiration date**.
- View donor contact details and pickup street address.
- Transition relief van dispatch statuses:
  - `Pending` ➔ `Assigned` (Volunteer van assigned) ➔ `Collected` (Picked up) ➔ `Distributed` (Served).

---

### Tab 8: Ground Distributions
Maintains transparency by publishing verified field distribution events:
- Record location, campaign name, execution date, meals served, and beneficiaries helped.
- Attach photographic proof URLs (must show field distribution with volunteers).
- Toggle section visibility, or clear all / load sample records.

---

### Tab 9: Expenses
Public financial transparency ledger:
- Add itemized expenditures with category (`Grain Procurement`, `Transit Fuel`, `Packaging Materials`, `Medical Supplies`).
- Enter amount in INR, campaign association, date, and approving officer name.
- Real-time aggregation calculates percentage allocations displayed in the public transparency donut chart.

---

### Tab 10: Committee
Governing board and trustee profiles:
- Add or update board members, executive trustees, and medical advisors.
- Input member name, designation, background bio, specific governance responsibilities, and portrait URL.

---

### Tab 11: Stories
Verified beneficiary success stories:
- Create narrative case studies showing tangible impact.
- Enter beneficiary name, location, headline, summary narrative, and photo.
- Ensure legal consent has been obtained before publishing.

---

### Tab 12: FAQ
Maintains the interactive accordion on the homepage:
- Add questions and answers formatted in plain text or markdown.
- Assign categories (`General`, `Tax & 80G`, `Food Safety`, `Volunteering`).

---

### Tab 13: Volunteers
Field personnel administration:
- Review incoming volunteer applications (area, skills, availability).
- One-click actions:
  - **Approve**: Activates volunteer profile and generates official Digital Volunteer ID.
  - **Reject**: Declines application.
  - **Suspend**: Temporarily revokes field credentials.
- Monitor accumulated service hours and completed relief runs.

---

### Tab 14: Settings
Platform-wide rules and configuration:
- Site title and mission tagline.
- **Minimum Donation Floor**: Configured strictly to `₹20 INR`.
- **Role Capacity Governance Quotas (CMS Controlled)**:
  - **Max Administrator Slots**: Configured strictly to `1 Admin` (adjustable via CMS).
  - **Max Field Volunteer Slots**: Configured strictly to `4 Volunteers` (adjustable via CMS).
- Helpline phone number displayed in headers and footers.
- Impact counter baseline offsets.
- **Resend Email Integration**: Automated transactional dispatch for OTP verification codes, official 80G tax receipts, and volunteer status approvals.

---

### Tab 15: Payment QRs (Anti-Fraud Gate)
**Critical anti-fraud and financial security module:**
- All UPI QR codes uploaded by volunteers or field teams arrive here in `Pending` status.
- **No unapproved QR code is ever displayed to the public.**
- Administrator must verify:
  1. Bank beneficiary name matches registered trust entity.
  2. UPI ID is valid and active.
  3. QR image is clear and scannable.
- Click **Approve** to publish to the donation modal, or **Reject** to discard fraudulent submissions.

---

### Tab 16: Audit Logs
The immutable system ledger:
- Chronological, un-editable table of all administrative actions.
- Tracks:
  - Timestamp of modification
  - Acting Administrator name/email
  - Affected Entity (`PaymentQR`, `Campaign`, `Settings`, etc.)
  - Action performed (`Approve`, `Update`, `Create`, `Delete`)
  - Full details/diff of the change

