import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Skip limits during tests so they don't cause flaky failures.
const skip = () => env.NODE_ENV === 'test';
const message = (text) => ({ error: { code: 'RATE_LIMITED', message: text } });

const base = { standardHeaders: true, legacyHeaders: false };

// Applied to every /api route.
export const generalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip,
  message: message('Too many requests. Please try again later.'),
});

// Stricter limit for register/login (Step 3).
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip,
  message: message('Too many attempts. Please try again in a few minutes.'),
});

// For file uploads (Step 9).
export const uploadLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 50,
  skip,
  message: message('Upload limit reached. Please try again later.'),
});

// For unauthenticated doctor notes on share links (Step 22).
export const publicNoteLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 10,
  skip,
  message: message('Too many notes submitted. Please try again later.'),
});
