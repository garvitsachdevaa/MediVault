import { User } from '../models/User.js';
import { verifyToken } from '../utils/tokens.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthError, ForbiddenError } from '../utils/AppError.js';

// Reads the Bearer token, verifies it, loads the user, sets req.user.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AuthError('Authentication required');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AuthError('Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AuthError('User no longer exists');

  req.user = user;
  next();
});

// Platform-level admin check (admin sees aggregate numbers only, never health data).
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ForbiddenError('Admin access only'));
  return next();
};
