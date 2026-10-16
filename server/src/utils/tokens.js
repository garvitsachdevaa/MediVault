import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// JWT carries only the user id (sub). Sent in the Authorization: Bearer header.
export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
