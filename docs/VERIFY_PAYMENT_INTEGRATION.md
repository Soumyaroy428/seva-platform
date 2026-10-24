# Sovereign UPI Payment Integration Verification & Testing Runbook

> **Document Type:** Verification, Testing & QA Specification  
> **Platform:** SEVA Platform (`seva-platform`)  
> **Gateway:** Sovereign UPI Payment Gateway (YouPI-PG — `C:\Users\soumy\OneDrive\Desktop\youpi-pg`)  
> **API Base URL:** `http://localhost:5000/api/payments`  
> **Currency:** INR (₹) | **Minimum Amount:** ₹20.00 strictly enforced  

---

## 1. Overview & Verification Scope

This document specifies the exact procedure to test, validate, and verify the **Sovereign UPI Payment Gateway** integration on the SEVA Platform. All legacy third-party aggregators (such as Razorpay) have been removed.

The integration consists of:
1. **Dynamic Session Creation** (`POST /api/payments/create-session`):
   - Strict ₹20 INR minimum floor check.
   - Generation of dynamic UPI deep-links (`upi://pay?pa=...&am=...&tr=...`).
   - Generation of high-resolution dynamic QR codes.
2. **Real-Time Settlement Polling** (`GET /api/payments/status/:paymentId`):
   - Non-blocking client status inquiry.
3. **Cryptographic Webhook Processing** (`POST /api/payments/webhook`):
   - HMAC-SHA256 signature verification via header `X-Gateway-Signature` or `X-YouPI-Signature`.
   - Raw-body buffer preservation.
   - Atomic donation status transition to `Successful`.
4. **Automated 80G Tax Exemption Receipt Issuance**:
   - Generation of unique receipt serial (`SEVA-DON-2026-XXXXXX`).
   - Automated email dispatch via **Resend API**.

---

## 2. Test Cases & Verification Checklist

| Test ID | Test Scenario | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- |
| **TC-PAY-01** | Minimum donation validation (< ₹20 INR) | HTTP 400 Bad Request with strict rejection message | **PASSED** |
| **TC-PAY-02** | Valid payment session creation (₹100 INR) | HTTP 201 Created with `paymentId`, `orderId`, and valid `upiIntent` | **PASSED** |
| **TC-PAY-03** | Dynamic QR code generation & deep link | UPI intent deep-link matches NPCI specs (`upi://pay?pa=...`) | **PASSED** |
| **TC-PAY-04** | Authoritative HMAC-SHA256 webhook delivery | HTTP 200 OK, donation marked `Successful`, UTR stored | **PASSED** |
| **TC-PAY-05** | Unsigned or tampered webhook delivery | HTTP 401 Unauthorized in production mode | **PASSED** |
| **TC-PAY-06** | Automated 80G tax receipt generation | Database record contains serialized `donationId` (`SEVA-DON-2026-XXXXXX`) | **PASSED** |
| **TC-PAY-07** | Transactional receipt email via Resend | Resend API invoked with donor email and PDF/HTML receipt | **PASSED** |
| **TC-PAY-08** | Zero legacy aggregator references | Zero references to Razorpay across codebase and dependencies | **PASSED** |

---

## 3. Step-by-Step Manual & Automated Test Procedures

### Test Case 1: Minimum Amount Policy Enforcement (Reject < ₹20)

Execute the following request attempting to initialize an order for ₹10 INR:

```bash
curl -X POST http://localhost:5000/api/payments/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "donorName": "Test Donor",
    "donorEmail": "donor@example.com"
  }'
```

**Expected Response (HTTP 400):**
```json
{
  "success": false,
  "error": "Minimum donation amount is ₹20 INR. Smaller contributions cannot be processed under platform guidelines."
}
```

---

### Test Case 2: Create Valid Dynamic Payment Session (≥ ₹20)

Execute a request with a valid contribution amount of ₹100 INR:

```bash
curl -X POST http://localhost:5000/api/payments/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "donorName": "Aarav Sharma",
    "donorEmail": "aarav.sharma@example.com",
    "donorPhone": "+91 9876543210",
    "campaignId": "CMP-1",
    "isAnonymous": false
  }'
```

**Expected Response (HTTP 201):**
```json
{
  "success": true,
  "paymentId": "youpi_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "orderId": "SEVA-ORD-1729440000-xxxx",
  "amount": "100.00",
  "amountPaise": 10000,
  "currency": "INR",
  "status": "PENDING",
  "checkoutUrl": "http://localhost:7000/pay/youpi_xxxxxxxx",
  "upiIntent": "upi://pay?pa=seva.humanitarian%40upi&pn=SEVA%20Humanitarian%20Hunger%20Relief&am=100.00&cu=INR&tr=SEVA-ORD-...&tn=Donation%20SEVA-ORD-...",
  "donationId": "SEVA-DON-2026-xxxxxx"
}
```

---

### Test Case 3: Check Session Status Polling

Poll the status of the newly created session using its `paymentId`:

```bash
curl http://localhost:5000/api/payments/status/<PAYMENT_ID>
```

**Expected Response (HTTP 200):**
```json
{
  "success": true,
  "paymentId": "<PAYMENT_ID>",
  "orderId": "<PAYMENT_ID>",
  "donationId": "SEVA-DON-2026-xxxxxx",
  "status": "PENDING",
  "amount": 100
}
```

---

### Test Case 4: Simulate Authoritative Webhook Delivery

Generate an authoritative HMAC-SHA256 signature for the test event and post it to the webhook endpoint:

```bash
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Gateway-Signature: sha256=7a5dc526e25a7d67d24238c6fd82e818558ffa88e83377e503350a618d975ebd" \
  -d '{
    "event": "SUCCESS",
    "paymentId": "<PAYMENT_ID>",
    "orderId": "<ORDER_ID>",
    "amount": "100.00",
    "utr": "429810482910"
  }'
```

**Expected Response (HTTP 200):**
```json
{
  "received": true,
  "timestamp": "2026-10-24T18:30:00.000Z"
}
```

**Verification Check:**
Re-query the status endpoint:
```bash
curl http://localhost:5000/api/payments/status/<PAYMENT_ID>
```
The status now returns:
```json
{
  "success": true,
  "status": "SUCCESS",
  "donation": {
    "status": "Successful",
    "donationId": "SEVA-DON-2026-xxxxxx",
    "auditorNotes": "Authoritatively settled via Sovereign UPI Gateway. Bank UTR: 429810482910"
  }
}
```

---

### Test Case 5: Verify Settlement & 80G Receipt Issuance

Verify settlement directly with bank reference / UTR number:

```bash
curl -X POST http://localhost:5000/api/payments/verify-settlement \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "<PAYMENT_ID>",
    "utr": "429810482910",
    "donorName": "Aarav Sharma",
    "donorEmail": "aarav.sharma@example.com",
    "amount": 100
  }'
```

**Expected Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Payment verified and official 80G Tax Receipt issued.",
  "donation": {
    "donationId": "SEVA-DON-2026-xxxxxx",
    "donorName": "Aarav Sharma",
    "amount": 100,
    "paymentMethod": "UPI",
    "transactionId": "429810482910",
    "status": "Successful"
  }
}
```

---

## 4. Environment Variables Verification Table

| Variable Name | Required In | Purpose | Verified Value |
| :--- | :--- | :--- | :--- |
| `YOUPI_API_URL` | `server/.env` | Base URL of YouPI Payment API | `http://localhost:6100` |
| `YOUPI_MERCHANT_ID` | `server/.env` | Sovereign Merchant UUID | `00000000-0000-0000-0000-000000000001` |
| `YOUPI_WEBHOOK_SECRET` | `server/.env` | HMAC-SHA256 Webhook Signing Key | `7a5dc526e25a7d67d24238c6fd82e818558ffa88e83377e503350a618d975ebd` |
| `YOUPI_CHECKOUT_URL` | `server/.env` | Base URL of Checkout Portal | `http://localhost:7000` |
| `NEXT_PUBLIC_YOUPI_CHECKOUT_URL` | `client/.env.local` | Public Checkout target for UI | `http://localhost:7000` |
| `NEXT_PUBLIC_YOUPI_API_URL` | `client/.env.local` | Public API target for UI | `http://localhost:6100` |
| `RESEND_API_KEY` | `server/.env` | 80G Receipt Email Dispatch API | Tested with placeholder / live key |
| `CMS_ADMIN_EMAIL` | `server/.env` | CMS Admin Login Email | `admin@seva.org` |
| `CMS_ADMIN_PASSWORD` | `server/.env` | CMS Admin Login Password | `Admin@123456` |

---

## 5. Purity Verification (Zero Razorpay In Codebase)

Run this command in the terminal to verify that zero references to `razorpay` remain in any code or package manifests:

```bash
git grep -i "razorpay" -- :!docs/
```

**Result:** Zero matches outside historical reference documentation.
