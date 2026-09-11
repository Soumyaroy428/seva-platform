# SEVA — Full-Phase Donation, Food Distribution & Community Support Platform
> **“Your Contribution. Someone's Meal. Someone's Hope.”**  
> Version: 1.0 | Currency: INR (₹) | Minimum Donation: ₹20

---

## Architecture Overview

The repository is cleanly separated into two distinct packages:

```
seva-platform/
├── package.json           # Monorepo root runner scripts
├── README.md              # Project documentation
│
├── client/                # Next.js 14 Frontend Application (Port 3000)
│   ├── package.json
│   ├── next.config.mjs    # Proxies /api/* to http://localhost:5000
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── page.tsx       # Landing Page (13 PRD Sections)
│       │   ├── admin/page.tsx # Admin Control Center
│       │   ├── donor/page.tsx # Donor Impact Portal
│       │   ├── volunteer/page.tsx # Volunteer Operations
│       │   └── beneficiary/page.tsx # Beneficiary Pass & Aid
│       └── components/        # 15+ UI Components (Donation, Receipt, Food, Badge, etc.)
│
└── server/                # Node.js + Express.js + Mongoose Backend (Port 5000)
    ├── package.json
    ├── .env               # PORT=5000, CORS_ORIGIN=http://localhost:3000
    └── src/
        ├── index.ts       # Express entrypoint & route registration
        ├── config/db.ts   # MongoDB connection & hybrid store fallback
        ├── models/        # All 22 PRD Database Collections
        ├── routes/        # REST APIs for campaigns, donations, QRs, food, etc.
        └── services/      # In-memory store, anti-fraud logic, & audit logging
```

---

## Quick Start

### 1. Start Backend Server (Express API - Port 5000)
```bash
cd server
npm install
npm run dev
```
Backend API will be live at: `http://localhost:5000`

### 2. Start Frontend Client (Next.js - Port 3000)
```bash
cd client
npm install
npm run dev
```
Frontend UI will be live at: `http://localhost:3000`

### 3. Or Run via Root Scripts
From the root directory (`seva-platform/`):
- `npm run dev:server` — Launches the Express backend
- `npm run dev:client` — Launches the Next.js frontend

---

## PRD Compliance Highlights
- **Minimum Donation**: ₹20 hard check enforced both on the client input and on the backend API (`/api/donations`).
- **QR Payment Approval**: Uploaded QRs require Admin approval (`/api/payment-qr`) before public display.
- **80G Tax Receipts**: Generated with unique IDs (`SEVA-DON-2026-XXXXXX`) and downloadable in printable format.
- **Food Safety Verification**: Expiration checks before surplus food pickup dispatch.
- **Role Portals**: Distinct hubs for Admin (`/admin`), Donor (`/donor`), Volunteer (`/volunteer`), and Beneficiary (`/beneficiary`).
