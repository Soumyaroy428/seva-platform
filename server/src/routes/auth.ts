import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';
import { authRateLimiter, otpSendRateLimiter } from '../middleware/rateLimiter';
import { requireAdmin, authenticateToken } from '../middleware/auth';

const router = Router();

// Get live role capacity quotas
router.get('/quotas', (req: Request, res: Response) => {
  res.json({ success: true, quotas: serverStore.getQuotas() });
});

// Register new user (donor, volunteer, or admin subject to quotas)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { initServer } = await import('../index.js');
    await initServer();

    const { name, email, password, role, phone, area, skills, availability } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (role === 'volunteer' || role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Public volunteer and administrator registration is disabled. Administrator and Field Volunteer credentials are managed exclusively via CMS and Environment Configuration.'
      });
    }

    const assignedRole: 'donor' = 'donor';

    const user = serverStore.createUser({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: assignedRole,
      phone,
      area,
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      availability
    });

    res.status(201).json({
      success: true,
      message: 'Donor account registered successfully. You can now login and make donations.',
      user
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// User login
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const identifier = (req.body.email || req.body.identifier || req.body.phone || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email or mobile number, and password are required.'
      });
    }

    const { initServer } = await import('../index.js');
    await initServer();

    const user = serverStore.authenticateUser(identifier, password);

    if (user.token) {
      res.cookie('seva_session', user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user,
      token: user.token
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// OTP: Send Verification Code to Mobile or Email
router.post('/send-otp', otpSendRateLimiter, (req: Request, res: Response) => {
  try {
    const { identifier, intent, registerData } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Mobile number or email address is required.' });
    }
    const result = serverStore.sendOTP(identifier, intent || 'login', registerData);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// OTP: Verify 6-digit Code & Login/Register
router.post('/verify-otp', authRateLimiter, (req: Request, res: Response) => {
  try {
    const { identifier, code, registerData } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, error: 'Identifier and OTP code are required.' });
    }
    const user = serverStore.verifyOTP(identifier, code, registerData);

    if (user.token) {
      res.cookie('seva_session', user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      success: true,
      message: 'Verification successful. Welcome to Seva!',
      user,
      token: user.token
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get current session / user profile with latest live status
router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const cookieToken = (req as any).cookies?.seva_session;
    const queryToken = req.query.token as string;
    const token = bearerToken || cookieToken || queryToken;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Missing session token.' });
    }

    const user = serverStore.getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or user not found.' });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout: Revoke session token and clear HTTP-only cookie
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieToken = (req as any).cookies?.seva_session;
  const token = bearerToken || cookieToken;

  if (token) {
    serverStore.invalidateToken(token);
  }
  res.clearCookie('seva_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.delete('/users/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const ok = serverStore.deleteUser(req.params.id as string);
    if (!ok) return res.status(404).json({ success: false, error: 'User not found.' });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
