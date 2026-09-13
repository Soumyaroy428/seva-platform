import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { serverStore } from './services/store';

import campaignsRouter from './routes/campaigns';
import donationsRouter from './routes/donations';
import paymentQrRouter from './routes/paymentQr';
import volunteersRouter from './routes/volunteers';
import beneficiariesRouter from './routes/beneficiaries';
import distributionsRouter from './routes/distributions';
import foodDonationsRouter from './routes/foodDonations';
import expensesRouter from './routes/expenses';
import adminRouter from './routes/admin';
import committeeRouter from './routes/committee';
import storiesRouter from './routes/stories';
import authRouter from './routes/auth';
import howItWorksRouter from './routes/howItWorks';
import faqRouter from './routes/faq';
import heroCardsRouter from './routes/heroCards';
import verifiedMetricsRouter from './routes/verifiedMetrics';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for frontend
const configuredOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : [];

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'https://seva-platform-pink.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server Next.js rewrites, mobile apps, curl)
    if (!origin) return callback(null, true);

    // Allow configured origins, defaults, wildcard, or any vercel.app deployment
    if (
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(origin) ||
      defaultOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

import mongoose from 'mongoose';

// Healthcheck with MongoDB live status
app.get(['/', '/api/health', '/api/db-status'], async (req, res) => {
  let dbState = mongoose.connection.readyState;
  const stateLabels: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  if (dbState === 0) {
    try {
      await initServer();
      dbState = mongoose.connection.readyState;
    } catch (err) {}
  }

  res.json({
    status: 'online',
    platform: 'SEVA Humanitarian Backend',
    version: '1.0.0',
    minDonationINR: 20,
    database: {
      connected: dbState === 1,
      status: stateLabels[dbState] || 'unknown',
      name: mongoose.connection.name || 'seva',
      host: mongoose.connection.host || null
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (PRD Section 65)
app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/payment-qr', paymentQrRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/beneficiaries', beneficiariesRouter);
app.use('/api/distributions', distributionsRouter);
app.use('/api/food-donations', foodDonationsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/committee', committeeRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/how-it-works', howItWorksRouter);
app.use('/api/faq', faqRouter);
app.use('/api/hero-cards', heroCardsRouter);
app.use('/api/verified-metrics', verifiedMetricsRouter);


// Initialize DB and launch server
let isDbReady = false;
export async function initServer() {
  if (!isDbReady) {
    await connectDB();
    await serverStore.syncWithMongoDB();
    isDbReady = true;
  }
}

if (!process.env.VERCEL) {
  initServer().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 SEVA Backend Server running on http://localhost:${PORT}`);
      console.log(`🔒 Minimum Donation Policy: ₹20 INR strictly enforced`);
    });
  }).catch(err => {
    console.error('Failed to initialize server:', err);
  });
} else {
  initServer().catch(err => console.error('Vercel serverless DB init error:', err));
}

export default app;

