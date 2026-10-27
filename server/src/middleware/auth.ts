import { Request, Response, NextFunction } from 'express';
import { serverStore } from '../services/store';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Extracts and validates the session token from Authorization header or HTTP-only cookie.
 */
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieToken = (req as any).cookies?.seva_session;
  const headerToken = req.headers['x-admin-token'] as string;
  const queryToken = req.query.token as string;

  const token = bearerToken || cookieToken || headerToken || queryToken;

  // Master Environment Passkey (strictly if configured in Vercel/process.env)
  const envAdminPass = (process.env.CMS_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim();
  const isMasterKey = Boolean(envAdminPass && (req.headers['x-admin-key'] === envAdminPass || req.body?.adminKey === envAdminPass));

  if (isMasterKey) {
    req.user = {
      id: 'admin_cms_master',
      name: process.env.CMS_ADMIN_NAME || 'Chief Administrator (System Key)',
      email: (process.env.CMS_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@seva-foundation.internal').trim().toLowerCase(),
      role: 'admin'
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.',
      code: 'AUTH_REQUIRED'
    });
  }

  let user = serverStore.getUserFromToken(token);
  if (!user) {
    user = await serverStore.resolveUserFromToken(token);
  }
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please log in again.',
      code: 'INVALID_OR_EXPIRED_TOKEN'
    });
  }

  req.user = user;
  next();
}

/**
 * Enforces Administrator-only role access.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Administrator privileges required to perform this action.',
        code: 'ADMIN_PRIVILEGES_REQUIRED'
      });
    }
    next();
  });
}

/**
 * Enforces Staff access (Admin or Field Volunteer).
 */
export function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'volunteer')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Staff privileges (Admin or Volunteer) required to perform this action.',
        code: 'STAFF_PRIVILEGES_REQUIRED'
      });
    }
    next();
  });
}
