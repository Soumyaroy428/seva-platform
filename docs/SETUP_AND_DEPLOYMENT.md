# SEVA Platform — Setup, Configuration & Production Deployment Guide

> **Document Type:** Setup, Configuration & DevOps Manual  
> **Target Audience:** Developers, DevOps Engineers, Cloud Administrators  
> **Platform Version:** 1.0.0 | **Node Version:** >= 18.x | **Package Manager:** npm 9.x+

---

## 1. System Requirements & Prerequisites

Before launching the SEVA Platform, ensure you have:
- **Node.js**: Version 18.x or 20.x installed (`node -v`).
- **npm**: Version 9.x or higher (`npm -v`).
- **MongoDB**: Either a local MongoDB instance (`mongodb://localhost:27017/seva`) or a MongoDB Atlas cluster URI. *(Note: If no database URI is provided, the platform automatically boots using its built-in reactive in-memory store).*
- **Sovereign UPI Gateway (YouPI-PG)**: Running locally on port 6100 (Payment API) & port 7000 (Checkout Portal) or on a secure host domain.
- **Resend API Key**: Free API key from [resend.com](https://resend.com) for sending transactional emails (6-digit OTPs and official 80G tax exemption receipts).

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

# Sovereign UPI Payment Gateway (YouPI-PG)
YOUPI_API_URL=http://localhost:6100
YOUPI_MERCHANT_ID=00000000-0000-0000-0000-000000000001
YOUPI_WEBHOOK_SECRET=7a5dc526e25a7d67d24238c6fd82e818558ffa88e83377e503350a618d975ebd
YOUPI_CHECKOUT_URL=http://localhost:7000

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

# Sovereign UPI Gateway Public Checkout Target
NEXT_PUBLIC_YOUPI_CHECKOUT_URL=http://localhost:7000
NEXT_PUBLIC_YOUPI_API_URL=http://localhost:6100

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

### Step 2: Launch Backend Service
From the `server/` directory:

```bash
# Start backend in development mode with hot-reloading
npm run dev
```
The server will boot on `http://localhost:5000`. You should see:
```
🚀 SEVA Backend Server running on http://localhost:5000
🔒 Minimum Donation Policy: ₹20 INR strictly enforced
✅ CMS Administrator initialized from env: admin@seva.org
```

### Step 3: Launch Frontend Service
From the `client/` directory:

```bash
# Start frontend Next.js dev server
npm run dev
```
Open your browser to `http://localhost:3000`.

---

## 4. Production Build Process

### Step 1: Build Backend TypeScript
```bash
cd server
npm run build
```
This runs `tsc` and outputs compiled JavaScript to `server/dist/`.

### Step 2: Build Next.js Frontend
```bash
cd client
npm run build
```
This generates optimized standalone static HTML/JS bundles in `client/.next/`.

---

## 5. Deployment Guide (Vercel Serverless Architecture)

The SEVA Platform is optimized for cloud deployment on Vercel as two decoupled projects (or a unified monorepo).

### 5.1 Deploying the Frontend (`client/`)
1. Import the `client/` folder as a Next.js project on Vercel.
2. Configure Environment Variables in the Vercel dashboard:
   - `BACKEND_URL`: URL of your deployed Express API (e.g. `https://seva-platform-api.vercel.app`).
   - `NEXT_PUBLIC_YOUPI_CHECKOUT_URL`: `http://localhost:7000` or production gateway URL.
   - `NEXT_PUBLIC_CMS_ADMIN_EMAIL`: `admin@seva.org`
   - `NEXT_PUBLIC_CMS_ADMIN_PASSWORD`: `Admin@123456`
   - `NEXT_PUBLIC_MAX_ADMINS`: `1`
   - `NEXT_PUBLIC_MAX_VOLUNTEERS`: `4`
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
   - `YOUPI_API_URL`
   - `YOUPI_MERCHANT_ID`
   - `YOUPI_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
   - `CMS_ADMIN_EMAIL`
   - `CMS_ADMIN_PASSWORD`
   - `MAX_ADMINS`
   - `MAX_VOLUNTEERS`
   - `CORS_ORIGIN` (Include your frontend `.vercel.app` domain)
3. The serverless tracker (`pendingMongoOps` in `server/src/index.ts`) ensures all Mongoose writes complete before serverless execution pauses.

---

## 6. Testing Guide & Test Credentials

### 6.1 Testing Sovereign UPI Payments (YouPI-PG)
1. Open the donation modal on `http://localhost:3000`.
2. Select or enter an amount (>= ₹20).
3. Click **Pay with Dynamic UPI**.
4. The system initializes a dynamic payment session via `POST /api/payments/create-session`.
5. Scan the dynamic QR code with any mobile UPI app, click **Open Installed UPI App**, or click **I have authorized the payment (Confirm Now)**.
6. Upon payment settlement confirmation:
   - The transaction is recorded in MongoDB/store.
   - The official 80G Tax Receipt modal opens with a unique `SEVA-DON-2026-XXXXXX` serial.
   - An 80G Tax Receipt email is automatically dispatched to the donor's email via Resend.

### 6.2 Testing CMS Administrator Environment Login
1. Navigate to `http://localhost:3000/login`.
2. Click the **CMS Admin Login** tab.
3. Verify the form loads the environment credentials:
   - Email: `admin@seva.org`
   - Password: `Admin@123456`
4. Click **Sign In as CMS Administrator**.
5. Verify that login succeeds immediately and redirects directly to `/admin` with full access to all 16 CMS governance tabs.

### 6.3 Testing Static UPI QR Code Payments
1. Select **Static Bank QR Code** in the donation modal.
2. Verify the approved QR image is rendered with the copy UPI ID button.
3. Enter transaction reference ID and submit.
4. Verify the printable receipt displays payment mode as `UPI`.

### 6.4 Testing Food Safety Validation
1. Open the Food Rescue modal on the homepage.
2. Attempt to submit with a `safeUntil` date in the past.
3. Verify that the form and API return HTTP 400: *"Food past its safe consumption time cannot be accepted under food safety guidelines."*

---

## 7. Troubleshooting & FAQs

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 5000 Already in Use** | Another process is holding port 5000. | Run `netstat -ano \| findstr :5000` on Windows and terminate the process with `taskkill /PID <PID> /F`, or change `PORT=5001` in `server/.env` and update `BACKEND_URL` in `client/.env.local`. |
| **MongoDB Atlas Connection Timeout** | Network firewall or IP whitelist issue. | In MongoDB Atlas Dashboard > Network Access, add `0.0.0.0/0` (Allow access from anywhere) or whitelist your local IP. |
| **YouPI Webhook Signature Fails** | Mismatched `YOUPI_WEBHOOK_SECRET` between Seva and YouPI-PG. | Ensure `YOUPI_WEBHOOK_SECRET` configured in `server/.env` exactly matches the gateway key. Raw body parser is automatically active. |
| **CORS Policy Warning in Console** | Browser calling port 5000 directly instead of through Next.js proxy. | Ensure client-side requests use `/api/...` so they pass through `next.config.mjs` rewrites. |
