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
import razorpayRouter from './routes/razorpay';

const app = express();
const PORT = process.env.PORT || 5000;

// Vercel Serverless Hack: Track all pending Mongoose operations
export const pendingMongoOps = new Set<Promise<any>>();
const wrapMongo = (fn: Function) => function(this: any, ...args: any[]) {
  const p = fn.apply(this, args);
  if (p && p.then) {
    pendingMongoOps.add(p);
    p.finally(() => pendingMongoOps.delete(p));
  }
  return p;
};
import mongoose from 'mongoose';
['create', 'insertMany', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndReplace', 'findOneAndDelete'].forEach(method => {
  if ((mongoose.Model as any)[method]) (mongoose.Model as any)[method] = wrapMongo((mongoose.Model as any)[method]);
});

// Middleware to await all pending Mongo operations before sending response
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalEnd = res.end.bind(res);
  
  const flushAndSend = async (sender: Function, body?: any) => {
    if (pendingMongoOps.size > 0) {
      await Promise.allSettled(Array.from(pendingMongoOps));
    }
    sender(body);
  };

  res.json = (body) => { flushAndSend(originalJson, body); return res; };
  res.send = (body) => { flushAndSend(originalSend, body); return res; };
  res.end = ((chunk: any, encoding: any, cb: any) => {
    if (pendingMongoOps.size > 0) {
      Promise.allSettled(Array.from(pendingMongoOps)).then(() => originalEnd(chunk, encoding, cb));
    } else {
      originalEnd(chunk, encoding, cb);
    }
    return res;
  }) as any;
  next();
});

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
      isDbReady = false; // Force retry for debugging
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
    debug: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasDbUrl: !!process.env.DATABASE_URL
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
app.use('/api/razorpay', razorpayRouter);


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

