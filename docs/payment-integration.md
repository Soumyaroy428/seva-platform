# Sovereign UPI Payment Integration Specification (YouPI-PG)

> **Document Type:** Technical Integration Specification & Architecture Guide  
> **Platform:** SEVA Platform (`seva-platform`)  
> **Gateway:** YouPI-PG Sovereign UPI Payment Gateway  
> **Currency:** INR (₹)  
> **Status:** Active Standard  

---

## 1. Overview & Architectural Goals

The SEVA Platform has migrated away from proprietary payment aggregators (such as Razorpay) to a self-sovereign, peer-to-peer UPI payment gateway protocol powered by **YouPI-PG** (`youpi-pg`).

### Key Benefits of Sovereign UPI Integration:
1. **0% Intermediary Fees**: Peer-to-peer UPI settlement ensures 100% of donor contributions go directly to food rescue, meals, and relief operations.
2. **Instant Dynamic QR Codes**: High-conversion QR codes with embedded merchant metadata, dynamic order reference, and precise transaction amounts.
3. **Deep Link Intent Routing**: On mobile devices, donors click one button to open their preferred UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED).
4. **Observer-Driven Settlement**: Bank credit SMS and app notifications are processed by YouPI observers to provide automated, authoritative confirmation with 12-digit UTR tracking.
5. **Automated 80G Tax Exemption Receipts**: Verified transactions automatically trigger serialization of official 80G tax receipts and dispatch via the **Resend** email service.

---

## 2. API Contract & Endpoints

### 2.1 Backend Payment Endpoints (`/api/payments`)

| Method | Endpoint | Description | Auth / Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-session` | Creates a new payment session on YouPI gateway | Server validation (Min ₹20) |
| `GET` | `/api/payments/status/:paymentId` | Polls the latest transaction status | Open to client session |
| `POST` | `/api/payments/webhook` | Receives authoritative status updates from gateway | HMAC-SHA256 Signature Header |

### 2.2 Payment Session Creation Schema

#### Request (`POST /api/payments/create-session`)
```json
{
  "orderId": "SEVA-ORD-1729440000",
  "amount": "250.00",
  "currency": "INR",
  "customer": {
    "name": "Priya Sen",
    "email": "priya.sen@example.com",
    "phoneNumber": "9830012345"
  },
  "metadata": {
    "campaignId": "CMP-1",
    "isAnonymous": false
  }
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "paymentId": "c7942127-14e3-469a-9e4a-9359a16f903a",
  "orderId": "SEVA-ORD-1729440000",
  "amount": "250.00",
  "amountPaise": 25000,
  "currency": "INR",
  "status": "PENDING",
  "checkoutUrl": "http://localhost:7000/pay/c7942127-14e3-469a-9e4a-9359a16f903a",
  "upiIntent": "upi://pay?pa=seva@upi&pn=SevaPlatform&am=250.00&tr=c7942127-14e3-469a-9e4a-9359a16f903a&cu=INR"
}
```

---

## 3. Webhook Delivery & Cryptographic Verification

When payment is credited to the NGO's account, YouPI-PG delivers an authoritative webhook to the SEVA Platform.

### 3.1 Webhook Headers
```http
POST /api/payments/webhook HTTP/1.1
Host: seva-platform-api.vercel.app
Content-Type: application/json
X-Gateway-Signature: sha256=4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945
X-Gateway-Delivery-Id: del_9f82b71e-01a2-4a5c-8972
```

### 3.2 Webhook Payload
```json
{
  "event": "SUCCESS",
  "paymentId": "c7942127-14e3-469a-9e4a-9359a16f903a",
  "orderId": "SEVA-ORD-1729440000",
  "amount": "250.00",
  "amountPaise": 25000,
  "currency": "INR",
  "method": "UPI",
  "utr": "429810482910",
  "completedAt": "2026-10-24T18:30:00.000Z",
  "metadata": {
    "campaignId": "CMP-1",
    "isAnonymous": false
  }
}
```

### 3.3 Verification Logic
```typescript
import crypto from 'crypto';

export function verifyGatewaySignature(
  rawPayload: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;
  
  const cleanSignature = signatureHeader.replace(/^sha256=/, '').trim();
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawPayload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature, 'hex'),
    Buffer.from(computedSignature, 'hex')
  );
}
```

---

## 4. 80G Tax Exemption Receipt Automation

Upon successful HMAC signature verification, the SEVA backend executes the following atomic transactions:
1. **Donation Status Transition**: Updates donation from `Pending` to `Verified` in MongoDB and the reactive store.
2. **UTR Reference Recorded**: Stores the bank's 12-digit UTR number in `transactionId` or `auditorNotes`.
3. **Receipt Generation**: Generates an authoritative serial ID `SEVA-REC-2026-XXXXXX`.
4. **Resend Transactional Email**: Automatically compiles the 80G receipt and dispatches it to the donor's provided email.

---

## 5. Security & Compliance Checklist

- [x] **Zero Raw Secrets in Frontend**: `YOUPI_WEBHOOK_SECRET` and `RESEND_API_KEY` are kept exclusively in server-side environment variables.
- [x] **Timing-Safe Equality**: HMAC signature comparison uses `crypto.timingSafeEqual` to prevent timing attacks.
- [x] **Strict ₹20 Floor**: Server rejects requests below ₹20 with HTTP 400.
- [x] **Raw Body Preservation**: Express middleware captures the raw Buffer for signature validation before JSON parsing.
- [x] **Idempotency**: Webhook deliveries deduplicate by `paymentId` and `orderId` to prevent multiple receipts for the same bank credit.
