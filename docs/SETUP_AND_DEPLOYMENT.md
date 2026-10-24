# SEVA Platform — Setup, Configuration & Deployment Guide

> **Document Type:** Developer Operations & Deployment Manual  
> **Platform Version:** 1.0.0 | **Node Version:** >= 18.x | **Package Manager:** npm

---

## 1. System Prerequisites

Before launching the SEVA Platform, ensure you have:
- **Node.js**: Version 18.x or 20.x installed (`node -v`).
- **npm**: Version 9.x or higher (`npm -v`).
- **MongoDB**: Either a local MongoDB instance (`mongodb://localhost:27017/seva`) or a MongoDB Atlas cluster URI. *(Note: If no database URI is provided, the platform automatically boots using its built-in reactive in-memory store).*
- **Razorpay Account**: API Key ID and Secret Key from your Razorpay Dashboard (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`). Optional: Sovereign UPI Gateway (YouPI-PG) for local P2P UPI experiments.

---

## 2. Environment Variables Configuration

The project uses two separate environment files for the backend and frontend.

### 2.1 Backend Configuration (`server/.env`)
Create or edit `server/.env`:

```env
# Server Port
PORT=5000

# MongoDB Database Connection
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/seva?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/seva?retryWrites=true&w=majority

# Allowed CORS Origins (Comma-separated)
CORS_ORIGIN=http://localhost:3000

# Razorpay Payment Gateway Credentials (Test Keys)
RAZORPAY_KEY_ID=rzp_test_TcmMNzUCymX672
RAZORPAY_KEY_SECRET=IJFFj3f9391pf3FiDiApAIHZ

# Resend Email API Credentials
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=SEVA Platform <onboarding@resend.dev>

# CMS Administrator Credentials (Env Controlled)
CMS_ADMIN_EMAIL=admin@seva.org
CMS_ADMIN_PASSWORD=Admin@123456

# Role Capacity Governance Quotas (CMS & Env Controlled)
MAX_ADMINS=1
MAX_VOLUNTEERS=4
```

### 2.2 Frontend Configuration (`client/.env.local`)
Create or edit `client/.env.local`:

```env
# Backend API Target (Used by Next.js Rewrites)
BACKEND_URL=http://localhost:5000

# Direct MongoDB URI (Optional for direct SSR routes)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/seva?retryWrites=true&w=majority

# Public Razorpay Key for Frontend Checkout SDK
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TcmMNzUCymX672

# CMS Administrator Credentials (Env Controlled)
NEXT_PUBLIC_CMS_ADMIN_EMAIL=admin@seva.org
NEXT_PUBLIC_CMS_ADMIN_PASSWORD=Admin@123456

# Role Capacity Governance Quotas (CMS & Env Controlled)
NEXT_PUBLIC_MAX_ADMINS=1
NEXT_PUBLIC_MAX_VOLUNTEERS=4
```

---

## 3. Local Development Setup

### Step 1: Install Dependencies
Run npm install in both directories:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Start Backend Server (Port 5000)
```bash
cd server
npm run dev
```
You should see:
```
✅ MongoDB connected successfully to database: "seva" on cluster0...
🚀 SEVA Backend Server running on http://localhost:5000
🔒 Minimum Donation Policy: ₹20 INR strictly enforced
```

### Step 3: Start Frontend Client (Port 3000)
In a new terminal:
```bash
cd client
npm run dev
```
Open your browser to: **`http://localhost:3000`**

### Step 4: Or Run via Root Scripts
From the root directory (`seva-platform/`):
- `npm run dev:server` — Launches Express API on `http://localhost:5000`
- `npm run dev:client` — Launches Next.js UI on `http://localhost:3000`

---

## 4. Production Build & Execution

### Build Backend
```bash
cd server
npm run build
npm start
```
Compiles TypeScript into `server/dist/` and starts with Node.js.

### Build Frontend
```bash
cd client
npm run build
npm start
```
Builds optimized Next.js production bundle.

---

## 5. Vercel Deployment Guide

The SEVA Platform is optimized for seamless deployment to Vercel:

### 5.1 Deploying the Frontend (`client/`)
1. Import the `client/` folder as a project in Vercel.
2. In Project Settings > Environment Variables, configure:
   - `BACKEND_URL`: URL of your deployed Express API (e.g. `https://seva-api.yourdomain.com`).
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay Key ID.
3. Next.js proxy rewrites in `client/next.config.mjs` will automatically redirect all `/api/*` browser traffic to your production backend without CORS errors.

### 5.2 Deploying the Backend (`server/`)
1. The backend includes a `server/vercel.json` configured for serverless execution:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```
2. Configure Environment Variables in the Vercel backend project:
   - `MONGODB_URI`
   - `DATABASE_URL`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RESEND_API_KEY`
   - `CMS_ADMIN_EMAIL`
   - `CMS_ADMIN_PASSWORD`
   - `MAX_ADMINS`
   - `MAX_VOLUNTEERS`
   - `CORS_ORIGIN` (Include your frontend `.vercel.app` domain)
3. The serverless tracker (`pendingMongoOps` in `server/src/index.ts`) ensures all Mongoose writes complete before serverless execution pauses.

---

## 6. Testing Guide & Test Credentials

### 6.1 Testing Razorpay Payments
1. Open the donation modal on `http://localhost:3000`.
2. Select or enter an amount (>= ₹20).
3. Select **Card / Netbanking / Razorpay**.
4. Use standard Razorpay test card credentials (any valid future expiry date, CVV `123`, OTP `123456`).
5. Upon payment success, verify that:
   - The transaction is recorded in MongoDB/store.
   - The official 80G Tax Receipt modal opens with a unique `SEVA-DON-2026-XXXXXX` serial.
   - An 80G Tax Receipt email is automatically dispatched to the donor's email via Resend.

### 6.2 Testing UPI QR Code Payments
1. Select **UPI / QR Code** in the donation modal.
2. Verify the approved QR image is rendered with the copy UPI ID button.
3. Enter transaction reference ID and submit.
4. Verify the printable receipt displays payment mode as `UPI`.

### 6.3 Testing Food Safety Validation
1. Open the Food Rescue modal on the homepage.
2. Attempt to submit with a `safeUntil` date in the past.
3. Verify that the form and API return HTTP 400: *"Food past its safe consumption time cannot be accepted under food safety guidelines."*

---

## 7. Troubleshooting & FAQs

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 5000 Already in Use** | Another process is holding port 5000. | Run `netstat -ano \| findstr :5000` on Windows and terminate the process with `taskkill /PID <PID> /F`, or change `PORT=5001` in `server/.env` and update `BACKEND_URL` in `client/.env.local`. |
| **MongoDB Atlas Connection Timeout** | Network firewall or IP whitelist issue. | In MongoDB Atlas Dashboard > Network Access, add `0.0.0.0/0` (Allow access from anywhere) or whitelist your local IP. |
| **Razorpay Signature Verification Fails** | Mismatched `RAZORPAY_KEY_SECRET` between `.env` and account. | Ensure the exact secret key from your Razorpay dashboard corresponds to the `RAZORPAY_KEY_ID`. |
| **CORS Policy Warning in Console** | Browser calling port 5000 directly instead of through Next.js proxy. | Ensure client-side requests use `/api/...` so they pass through `next.config.mjs` rewrites. |

