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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SEVA Humanitarian Backend',
    version: '1.0.0',
    minDonationINR: 20,
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
connectDB().then(async () => {
  await serverStore.syncWithMongoDB();
  app.listen(PORT, () => {
    console.log(`🚀 SEVA Backend Server running on http://localhost:${PORT}`);
    console.log(`🔒 Minimum Donation Policy: ₹20 INR strictly enforced`);
  });
});

export default app;
