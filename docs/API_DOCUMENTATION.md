# SEVA Platform — REST API Documentation

> **Document Type:** API Reference Specification  
> **Backend Base URL (Local):** `http://localhost:5000` (Proxied via `http://localhost:3000/api/*`)  
> **Authentication:** Bearer tokens / Session Cookies / Public REST  
> **Payload Format:** JSON (`Content-Type: application/json`)

---

## 1. System & Health Endpoints

### `GET /` | `GET /api/health` | `GET /api/db-status`
Retrieves live health status, minimum donation rule, and MongoDB connectivity diagnostics.

**Response (200 OK):**
```json
{
  "status": "online",
  "platform": "SEVA Humanitarian Backend",
  "version": "1.0.0",
  "minDonationINR": 20,
  "database": {
    "connected": true,
    "status": "connected",
    "name": "seva",
    "host": "cluster0.7q4i6rp.mongodb.net"
  },
  "debug": {
    "hasMongoUri": true,
    "hasDbUrl": true
  },
  "timestamp": "2026-10-20T17:41:00.000Z"
}
```

---

## 2. Authentication & User Quotas (`/api/auth`)

### `GET /api/auth/quotas`
Fetches real-time capacity quotas for Admins and Volunteers.

**Response (200 OK):**
```json
{
  "success": true,
  "quotas": {
    "admins": { "current": 2, "max": 5, "isFull": false, "availableSlots": 3 },
    "volunteers": { "current": 18, "approvedCount": 14, "max": 50, "isFull": false, "availableSlots": 32 }
  }
}
```

### `POST /api/auth/register`
Registers a new user account subject to role capacity quota availability.

**Request Body:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "SecurePassword123",
  "role": "volunteer",
  "phone": "+91 9876543210",
  "area": "Central Slum Zone",
  "skills": ["Logistics & Packaging", "Driving & Vehicle Transit"],
  "availability": "Weekends"
}
```

### `POST /api/auth/login`
Authenticates with email and password.

**Request Body:**
```json
{
  "email": "arjun@example.com",
  "password": "SecurePassword123"
}
```

### `POST /api/auth/send-otp`
Dispatches a 6-digit OTP code to a mobile phone or email.

**Request Body:**
```json
{
  "identifier": "+91 9876543210",
  "intent": "login"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verification code sent to +91 9876543210.",
  "otpPreview": "482910"
}
```

### `POST /api/auth/verify-otp`
Validates 6-digit OTP code and logs the user in.

**Request Body:**
```json
{
  "identifier": "+91 9876543210",
  "code": "482910"
}
```

### `GET /api/auth/me?email=...`
Refreshes live user profile and role approval status.

---

## 3. Campaigns API (`/api/campaigns`)

### `GET /api/campaigns`
Returns all active hunger and relief campaigns.

### `GET /api/campaigns/section-settings`
Returns visibility and display settings for the campaigns section.

### `POST /api/campaigns/section-settings`
Admin endpoint to update badge text, heading, subheading, and toggle section visibility.

### `POST /api/campaigns`
Creates a new relief campaign.

**Request Body:**
```json
{
  "title": "Winter Ration Kits for Remote Villages",
  "targetAmount": 300000,
  "coverImage": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
  "description": "Distributing warm rations, pulses, and blankets to 500 remote families.",
  "location": "Sundarbans Delta Zone",
  "isEmergency": true
}
```

### `PUT /api/campaigns/:id`
Updates an existing campaign's fields.

### `DELETE /api/campaigns/:id`
Deletes a campaign from the database.

### `POST /api/campaigns/clear-all` & `POST /api/campaigns/load-sample`
Administrative helpers to test empty states and restore default campaigns.

---

## 4. Donations & Hand Cash (`/api/donations`)

### `GET /api/donations`
Returns donation records. Supports optional query parameter: `?donorEmail=...`.

### `POST /api/donations`
Records an online or UPI donation. **Strictly enforces ₹20 minimum rule.**

**Request Body:**
```json
{
  "donorName": "Sunita Sen",
  "donorEmail": "sunita@example.com",
  "donorPhone": "+91 9830112233",
  "amount": 250,
  "campaignId": "camp-1",
  "campaignTitle": "Warm Meals for Slum Children & Families",
  "paymentMethod": "UPI",
  "transactionId": "TXN-UPI-88419201",
  "isAnonymous": false,
  "recurringFrequency": "None"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Donation processed successfully. Thank you for your support!",
  "data": {
    "donationId": "SEVA-DON-2026-849102",
    "donorName": "Sunita Sen",
    "donorEmail": "sunita@example.com",
    "amount": 250,
    "campaignTitle": "Warm Meals for Slum Children & Families",
    "paymentMethod": "UPI",
    "status": "Successful",
    "createdAt": "2026-10-20T18:00:00.000Z"
  }
}
```

**Error Response (< ₹20) (400 Bad Request):**
```json
{
  "success": false,
  "error": "Minimum donation amount is ₹20. Smaller amounts cannot be processed."
}
```

### `POST /api/donations/cash`
Records physical hand cash collected on the field by authorized volunteers.

**Request Body:**
```json
{
  "donorName": "Rajesh Gupta",
  "donorPhone": "+91 9433112233",
  "donorEmail": "rajesh@gupta.in",
  "amount": 500,
  "campaignTitle": "Emergency Slum Food Relief",
  "receiptNote": "Collected during Sector 4 evening food run",
  "collectedBy": "Volunteer Rohit Sen",
  "date": "2026-10-20"
}
```

### `PATCH /api/donations/:id`
Updates donation status (`Verified`, `Verification Required`) and auditor notes.

---

## 5. Razorpay Payment Gateway (`/api/razorpay`)

### `POST /api/razorpay/create-order`
Creates a Razorpay order in smallest currency unit (paise).

**Request Body:**
```json
{
  "amount": 50000,
  "receipt": "receipt_1729440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "order_id": "order_Ox1894Zla",
  "amount": 50000,
  "currency": "INR"
}
```

### `POST /api/razorpay/verify-payment`
Cryptographically verifies Razorpay payment using HMAC-SHA256 signature verification.

**Request Body:**
```json
{
  "razorpay_order_id": "order_Ox1894Zla",
  "razorpay_payment_id": "pay_Ox1920Kdj",
  "razorpay_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully."
}
```

---

## 6. Payment QR Anti-Fraud API (`/api/payment-qr`)

### `GET /api/payment-qr`
Returns approved active UPI QR codes (`?all=true` for admin dashboard).

### `POST /api/payment-qr`
Staff or volunteers submit a QR code. Defaults to `status: "Pending"`.

### `PATCH /api/payment-qr`
Administrator approves or rejects a submitted QR code.

**Request Body:**
```json
{
  "qrId": "QR-1",
  "action": "approve",
  "reviewer": "Chief Administrator"
}
```

---

## 7. Food Rescue & Surplus Donations (`/api/food-donations`)

### `GET /api/food-donations`
Fetches all scheduled food rescues.

### `POST /api/food-donations`
Schedules a surplus meal pickup. Enforces safety and expiration validation.

**Request Body:**
```json
{
  "donorName": "Grand Orchid Banquet",
  "donorPhone": "+91 9831002200",
  "foodType": "Vegetable Biryani & Paneer Gravy",
  "quantity": "120 portions",
  "estimatedServings": 120,
  "preparedAt": "2026-10-20T14:00:00.000Z",
  "safeUntil": "2026-10-20T23:00:00.000Z",
  "dietaryCategory": "Vegetarian",
  "packaging": "Sealed Stainless Containers",
  "pickupLocation": "Plot 14, Salt Lake Sector 3, Kolkata",
  "pickupTime": "20:30 IST",
  "notes": "Food prepared at 2 PM, kept in hot holding cabinets."
}
```

**Error Response if Expired (400 Bad Request):**
```json
{
  "success": false,
  "error": "Food past its safe consumption time cannot be accepted under food safety guidelines."
}
```

### `PATCH /api/food-donations/:id/status`
Updates rescue status (`Assigned`, `Collected`, `Distributed`).

---

## 8. Ground Distributions (`/api/distributions`)

### `GET /api/distributions`
Returns all verified field food distribution events.

### `POST /api/distributions`
Records a distribution event with photographic evidence.

**Request Body:**
```json
{
  "campaignTitle": "Warm Meals for Slum Children & Families",
  "location": "Bidhannagar Railway Slum Cluster",
  "date": "2026-10-20",
  "volunteersAssigned": ["Rohit Sen", "Priya Das"],
  "mealsDistributed": 350,
  "beneficiariesCount": 110,
  "foodSource": "Seva Central Kitchen",
  "proofPhotos": ["https://images.unsplash.com/photo-1593113598332-cd288d649433"],
  "notes": "Evening meal distribution conducted without incident."
}
```

---

## 9. Beneficiaries & Digital Pass (`/api/beneficiaries`)

### `GET /api/beneficiaries`
Lists enrolled beneficiaries.

### `POST /api/beneficiaries`
Registers a household for direct food assistance, automatically issuing a QR entitlement token.

---

## 10. Financial Transparency & Expenses (`/api/expenses`)

### `GET /api/expenses`
Returns all operational expenditures.

### `POST /api/expenses`
Records an approved operational expense.

---

## 11. Real-Time Verified Metrics (`/api/verified-metrics`)

### `GET /api/verified-metrics`
Returns impact counters.

### `POST /api/verified-metrics`
Admin override for impact counters.

### `POST /api/verified-metrics/reset`
Resets all counters strictly to 0.

---

## 12. Dynamic Right Hero Visual Cards (`/api/hero-cards`)

### `GET /api/hero-cards`
Fetches dynamic hero card settings.

### `POST /api/hero-cards`
Updates title, progress percentage, raised amount, and visual tags.

### `DELETE /api/hero-cards`
Removes the right hero card.

---

## 13. Governance & Content APIs

- `/api/volunteers`: Volunteer registry, approvals, and removals.
- `/api/committee`: Management committee members CRUD.
- `/api/stories`: Beneficiary impact stories CRUD.
- `/api/how-it-works`: 4-step workflow CRUD.
- `/api/faq`: FAQ items CRUD with category filtering.
- `/api/admin/dashboard`: Platform KPI statistics, pending counters, and recent audits.
- `/api/admin/settings`: Emergency banner theme, helpline, minimum donation floor.
- `/api/admin/audit-logs`: Chronological log of administrative actions.

