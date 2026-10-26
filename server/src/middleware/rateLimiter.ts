import { Request, Response, NextFunction } from 'express';

interface IRateLimitEntry {
  count: number;
  firstRequest: number;
}

const memoryStore = new Map<string, IRateLimitEntry>();

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now - entry.firstRequest > 30 * 60 * 1000) {
      memoryStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const { windowMs, max, message } = options;
  const keyGen = options.keyGenerator || ((req: Request) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    return `${Array.isArray(ip) ? ip[0] : ip}`;
  });

  return (req: Request, res: Response, next: NextFunction) => {
    // Exclude automated internal tests if running test suite
    if (process.env.NODE_ENV === 'test' && req.headers['x-bypass-ratelimit'] === 'true') {
      return next();
    }

    const key = keyGen(req);
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record) {
      memoryStore.set(key, { count: 1, firstRequest: now });
      return next();
    }

    if (now - record.firstRequest > windowMs) {
      // Window expired, reset counter
      record.count = 1;
      record.firstRequest = now;
      return next();
    }

    record.count++;
    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.firstRequest + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message || `Too many attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
        retryAfterSeconds,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    next();
  };
}

/**
 * Sensitive login limiter: 10 attempts per 15 minutes per IP/identifier
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
  keyGenerator: (req: Request) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const identifier = (req.body?.email || req.body?.identifier || req.body?.phone || '').trim().toLowerCase();
    return `auth_${identifier || ip}`;
  }
});

/**
 * OTP send limiter: 5 requests per 10 minutes per IP/identifier
 */
export const otpSendRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests. Please wait 10 minutes before requesting a new code.',
  keyGenerator: (req: Request) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const identifier = (req.body?.identifier || '').trim().toLowerCase();
    return `otp_${identifier || ip}`;
  }
});
