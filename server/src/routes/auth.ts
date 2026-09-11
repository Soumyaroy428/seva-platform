import { Router, Request, Response } from 'express';
import { serverStore } from '../services/store';

const router = Router();

// Get live role capacity quotas
router.get('/quotas', (req: Request, res: Response) => {
  res.json({ success: true, quotas: serverStore.getQuotas() });
});

// Register new user (donor, volunteer, or admin subject to quotas)
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, area, skills, availability } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    const assignedRole: 'admin' | 'volunteer' | 'donor' = role === 'admin' ? 'admin' : (role === 'volunteer' ? 'volunteer' : 'donor');

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

    let message = 'Donor account registered successfully. You can now login and make donations.';
    if (assignedRole === 'volunteer') {
      message = 'Volunteer account registered successfully. Note: Access to operational dashboard requires Admin approval.';
    } else if (assignedRole === 'admin') {
      message = 'Administrator account registered successfully (Slot active). You can now access the Admin Console.';
    }

    res.status(201).json({
      success: true,
      message,
      user
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// User login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = serverStore.authenticateUser(email.trim().toLowerCase(), password);

    res.json({
      success: true,
      message: 'Login successful.',
      user
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// OTP: Send Verification Code to Mobile or Email
router.post('/send-otp', (req: Request, res: Response) => {
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
router.post('/verify-otp', (req: Request, res: Response) => {
  try {
    const { identifier, code, registerData } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, error: 'Identifier and OTP code are required.' });
    }
    const user = serverStore.verifyOTP(identifier, code, registerData);
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
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);
    const email = req.query.email as string;

    let user = null;
    if (token) {
      user = serverStore.getUserFromToken(token);
    } else if (email) {
      const found = serverStore.findUserByEmail(email);
      if (found) {
        if (found.role === 'volunteer') {
          const vol = serverStore.getVolunteers().find(v => v.email.toLowerCase() === found.email.toLowerCase() || (found.volunteerId && v.volunteerId === found.volunteerId));
          if (vol) {
            found.volunteerStatus = vol.status;
          }
        }
        const { password, ...safeUser } = found;
        user = safeUser;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or user not found.' });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/users/:id', (req: Request, res: Response) => {
  try {
    const ok = serverStore.deleteUser(req.params.id as string);
    if (!ok) return res.status(404).json({ success: false, error: 'User not found.' });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
