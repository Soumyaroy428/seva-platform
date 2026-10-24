# SEVA Platform — Official Documentation

> **“Your Contribution. Someone's Meal. Someone's Hope.”**  
> *Full-Phase Donation, Food Rescue & Community Support Platform*  
> **Currency:** INR (₹) | **Minimum Donation Policy:** ₹20 INR Strictly Enforced

---

## Welcome to the SEVA Platform Documentation Hub

This documentation directory contains comprehensive architectural, technical, operational, and database documentation for the **SEVA Platform**. It serves as the single source of truth for developers, administrators, operations teams, and auditors.

---

## Documentation Index

| Document | Purpose & Contents |
| :--- | :--- |
| **[1. What is Done Till Now (Features Completed)](./FEATURES_COMPLETED.md)** | **Exhaustive review** of every completed feature, portal, modal, anti-fraud rule, and compliance mechanism implemented in the codebase. |
| **[2. System Architecture](./ARCHITECTURE.md)** | Technical design, monorepo structure, Next.js 14 App Router, Express REST API, Mongoose dual-layer storage with memory fallback, and security design. |
| **[3. Database Models & Schema](./DATABASE_MODELS.md)** | Complete specification of all **25 Mongoose models**, schemas, field validations, default values, and indexes. |
| **[4. REST API Documentation](./API_DOCUMENTATION.md)** | Full endpoint reference for all **17 Express routers**, request/response schemas, query parameters, and status codes. |
| **[5. Administrator Operations Guide](./ADMIN_GUIDE.md)** | In-depth manual covering all **16 Admin tabs**, live quota limits, payment QR approvals, content management, and audit logging. |
| **[6. Setup, Configuration & Deployment](./SETUP_AND_DEPLOYMENT.md)** | Guide for environment variables (`.env`), Sovereign UPI Gateway (YouPI-PG) setup, Resend API, MongoDB Atlas connection, local development, and Vercel serverless deployment. |
| **[7. Payment Integration Prompt & Technical Guide](./PAYMENT_INTEGRATION_PROMPT.md)** | Master prompt and technical integration blueprint for the Sovereign UPI Payment Gateway. |
| **[8. Payment Integration Verification Runbook](./VERIFY_PAYMENT_INTEGRATION.md)** | Step-by-step test cases, cURL commands, webhook simulations, and 80G receipt verification procedures. |

---

## System Quick Reference

```
SEVA Platform Architecture:
┌────────────────────────────────────────────────────────┐
│               Frontend: Next.js 14 (Port 3000)          │
│   • Landing Page (13 PRD Sections)                     │
│   • Admin Portal (/admin - 16 Management Tabs)         │
│   • Donor Portal (/donor)                              │
│   • Volunteer Operations Hub (/volunteer)              │
│   • Beneficiary Aid Pass (/beneficiary)                │
│   • Secure Authentication & OTP System (/login)        │
└──────────────────────────┬─────────────────────────────┘
                           │ (Next.js Rewrites: /api/*)
┌──────────────────────────▼─────────────────────────────┐
│             Backend API: Express.js (Port 5000)         │
│   • 17 Modular Routers                                 │
│   • Sovereign UPI Session & HMAC-SHA256 Webhooks       │
│   • OTP Auth & Real-Time Capacity Quotas               │
│   • Strict ₹20 Minimum Donation Check                  │
│   • Anti-Fraud QR Approval Pipeline                    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          Dual-Layer Storage & State Engine             │
│   • Primary: MongoDB Atlas (25 Mongoose Collections)   │
│   • Fallback/Sync: In-Memory Reactive Store (2,400+ L) │
└────────────────────────────────────────────────────────┘
```

---

## Governance & Compliance Standards

1. **Strict Minimum Donation Policy**: All payment interfaces (UPI, Card, Netbanking, Cash) strictly enforce a minimum donation of **₹20 INR**. Smaller amounts are rejected both on client forms and backend validation.
2. **Payment QR Anti-Fraud Safeguard**: Any UPI QR code uploaded to the platform is tagged as `Pending` and cannot be displayed to the public until explicitly reviewed and approved by an Administrator.
3. **Official 80G Tax Exemption Receipts**: Generated with guaranteed unique serial IDs in the format `SEVA-DON-2026-XXXXXX` with full printable layout and itemized meal conversion ratio (₹25 ≈ 1 wholesome meal).
4. **Food Safety Expiration Protocol**: Any surplus food donation must provide `preparedAt` and `safeUntil` timestamps. Items past their safe consumption window are strictly rejected by the intake API.
5. **Role Capacity Quotas**: Enforces structural limits on administrative and field volunteer slots to prevent credential bloating and unauthorized privilege escalation.

