import { Invite } from '../models/Invite.js';
import { Membership } from '../models/Membership.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';
import { hashToken } from '../utils/secureToken.js';

const isUsable = (invite) =>
  invite && invite.status === 'pending' && invite.expiresAt > new Date();

// GET /api/invites/:token (public) — details for the invite screen.
export const getInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOne({ tokenHash: hashToken(req.params.token) })
    .populate('profileId', 'name')
    .populate('invitedBy', 'name');
  if (!isUsable(invite)) throw new NotFoundError('This invite is invalid or has expired');

  res.json({
    invite: {
      profileName: invite.profileId?.name,
      inviterName: invite.invitedBy?.name,
      role: invite.role,
      email: invite.email,
      expiresAt: invite.expiresAt,
    },
  });
});

// POST /api/invites/:token/accept (auth) — join the profile.
export const acceptInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOne({ tokenHash: hashToken(req.params.token) });
  if (!isUsable(invite)) throw new NotFoundError('This invite is invalid or has expired');

  if (invite.email !== req.user.email.toLowerCase()) {
    throw new ForbiddenError('This invite was sent to a different email address');
  }

  const existing = await Membership.findOne({ profileId: invite.profileId, userId: req.user.id });
  if (!existing) {
    await Membership.create({ profileId: invite.profileId, userId: req.user.id, role: invite.role });
  }
  invite.status = 'accepted';
  await invite.save();

  res.status(existing ? 200 : 201).json({ ok: true, profileId: invite.profileId });
});

// GET /api/invites/pending (auth) — pending invites for the user's email.
export const getPendingInvites = asyncHandler(async (req, res) => {
  const invites = await Invite.find({
    email: req.user.email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() },
  })
    .populate('profileId', 'name')
    .populate('invitedBy', 'name');

  res.json({
    invites: invites.map((i) => ({
      _id: i.id,
      profileName: i.profileId?.name,
      inviterName: i.invitedBy?.name,
      role: i.role,
    })),
  });
});
