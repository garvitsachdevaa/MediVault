import crypto from 'node:crypto';

// Opaque, URL-safe random token. Only its hash is stored server-side.
export const generateToken = () => crypto.randomBytes(32).toString('base64url');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
