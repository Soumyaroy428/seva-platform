import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { serverStore } from '../services/store';

const router = Router();

let razorpayInstance: any = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay API keys are not configured in the environment.');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

// STEP 1: BACKEND - Create Order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, receipt } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum amount must be at least 100 paise (?1).'
      });
    }

    const rzp = getRazorpayInstance();

    const options = {
      amount: parsedAmount, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await rzp.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err: any) {
    console.error('Razorpay Order Creation Error:', err);
    // Determine status based on error (401 for auth, 500 for general)
    const status = err.statusCode || (err.message.includes('configured') ? 401 : 500);
    res.status(status).json({ success: false, error: err.message || 'Failed to create order' });
  }
});

// STEP 3: BACKEND - Verify Signature
router.post('/verify-payment', (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required signature fields.'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay secret key not found in environment.'
      });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Signature is valid
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully.'
      });
    } else {
      // Signature mismatch
      res.status(400).json({
        success: false,
        error: 'Invalid signature. Payment verification failed.'
      });
    }
  } catch (err: any) {
    console.error('Razorpay Verification Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to verify payment' });
  }
});

// Fetch payment details
router.get('/payment/:paymentId', async (req: Request, res: Response) => {
  try {
    const payment = await getRazorpayInstance().payments.fetch(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch payment' });
  }
});

export default router;
