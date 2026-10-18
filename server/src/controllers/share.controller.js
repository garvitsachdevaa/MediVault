import { ShareLink } from '../models/ShareLink.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken, hashToken } from '../utils/secureToken.js';
import { clientOrigins } from '../config/env.js';

const EXPIRY_DAYS = { '24h': 1, '7d': 7, '30d': 30 };

const statusOf = (s, now = new Date()) =>
  s.revokedAt ? 'revoked' : s.expiresAt < now ? 'expired' : 'active';

// POST /api/profiles/:profileId/shares (caregiver)
export const createShare = asyncHandler(async (req, res) => {
  const { summary = true, medicines = true, testCodes = [], documentIds = [], expiry = '7d' } = req.body;
  const days = EXPIRY_DAYS[expiry] || 7;
  const token = generateToken();
  const share = await ShareLink.create({
    profileId: req.profile.id,
    createdBy: req.user.id,
    tokenHash: hashToken(token),
    include: { summary, medicines, testCodes, documentIds },
    expiresAt: new Date(Date.now() + days * 86400000),
  });
  const base = clientOrigins[0] || '';
  res.status(201).json({ shareLink: `${base}/s/${token}`, expiresAt: share.expiresAt, id: share._id });
});

// GET /api/profiles/:profileId/shares (viewer)
export const listShares = asyncHandler(async (req, res) => {
  const shares = await ShareLink.find({ profileId: req.profile.id }).sort({ createdAt: -1 });
  res.json({
    shares: shares.map((s) => ({
      _id: s._id,
      include: s.include,
      expiresAt: s.expiresAt,
      viewCount: s.viewCount,
      lastViewedAt: s.lastViewedAt,
      notes: s.notes,
      status: statusOf(s),
      createdAt: s.createdAt,
    })),
  });
});

// POST /api/shares/:id/revoke (caregiver)
export const revokeShare = asyncHandler(async (req, res) => {
  req.share.revokedAt = new Date();
  await req.share.save();
  res.json({ ok: true });
});
