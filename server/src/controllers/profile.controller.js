import { HealthProfile } from '../models/HealthProfile.js';
import { Membership } from '../models/Membership.js';
import { Invite } from '../models/Invite.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError, NotFoundError, ForbiddenError, ValidationError } from '../utils/AppError.js';
import { generateToken, hashToken } from '../utils/secureToken.js';
import { clientOrigins } from '../config/env.js';
import { cloudinaryConfigured } from '../config/cloudinary.js';
import { detectType } from '../pipeline/ingestion/detector.js';
import { validateFile } from '../pipeline/ingestion/validator.js';
import { uploadAvatar } from '../services/storage.js';
import { deleteProfileCascade } from '../services/profileCascade.js';

const withRole = (profile, role) => ({ ...profile.toJSON(), role });

// GET /api/profiles — profiles the user belongs to, with their role on each.
export const getProfiles = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({ userId: req.user.id }).populate('profileId');
  const profiles = memberships
    .filter((m) => m.profileId)
    .map((m) => withRole(m.profileId, m.role));
  res.json({ profiles });
});

// POST /api/profiles — create a profile; creator becomes owner.
export const createProfile = asyncHandler(async (req, res) => {
  const profile = await HealthProfile.create({ ...req.body, createdBy: req.user.id });
  await Membership.create({ profileId: profile.id, userId: req.user.id, role: 'owner' });
  res.status(201).json({ profile: withRole(profile, 'owner') });
});

// GET /api/profiles/:profileId (viewer)
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ profile: withRole(req.profile, req.membership.role) });
});

// PATCH /api/profiles/:profileId (caregiver)
export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.profile, req.body);
  await req.profile.save();
  res.json({ profile: withRole(req.profile, req.membership.role) });
});

// DELETE /api/profiles/:profileId (owner) — permanently delete the profile + all data.
export const deleteProfile = asyncHandler(async (req, res) => {
  await deleteProfileCascade(req.profile.id, req.user.id);
  res.json({ ok: true });
});

// GET /api/profiles/:profileId/summary (viewer)
export const getSummary = asyncHandler(async (req, res) => {
  res.json({
    profile: withRole(req.profile, req.membership.role),
    currentMedications: [], // filled in Step 17
    keyResults: [], // filled in Step 19
  });
});

// PATCH /api/profiles/:profileId/summary (caregiver)
export const updateSummary = asyncHandler(async (req, res) => {
  const fields = ['name', 'relation', 'dateOfBirth', 'bloodGroup', 'allergies', 'conditions', 'immunisations'];
  for (const f of fields) {
    if (f in req.body) req.profile[f] = req.body[f];
  }
  await req.profile.save();
  res.json({ profile: withRole(req.profile, req.membership.role) });
});

// POST /api/profiles/:profileId/photo (caregiver) — upload a profile photo.
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured()) {
    throw new AppError(503, 'STORAGE_UNCONFIGURED', 'File storage is not configured yet.');
  }
  if (!req.file) throw new ValidationError('No file was uploaded');

  const detected = await detectType(req.file.buffer);
  if (detected.category !== 'image') throw new ValidationError('Photo must be an image');
  await validateFile(req.file.buffer, detected);

  const result = await uploadAvatar(req.file.buffer);
  req.profile.photoUrl = result.secure_url;
  await req.profile.save();
  res.json({ profile: withRole(req.profile, req.membership.role) });
});

// GET /api/profiles/:profileId/members (viewer)
export const getMembers = asyncHandler(async (req, res) => {
  const members = await Membership.find({ profileId: req.profile.id }).populate(
    'userId',
    'name email photoUrl'
  );
  res.json({
    members: members
      .filter((m) => m.userId)
      .map((m) => ({ _id: m.id, role: m.role, user: m.userId })),
  });
});

// PATCH /api/profiles/:profileId/members/:userId (owner)
export const updateMemberRole = asyncHandler(async (req, res) => {
  const target = await Membership.findOne({ profileId: req.profile.id, userId: req.params.userId });
  if (!target) throw new NotFoundError('Member not found');

  if (target.role === 'owner' && req.body.role !== 'owner') {
    const owners = await Membership.countDocuments({ profileId: req.profile.id, role: 'owner' });
    if (owners <= 1) throw new ForbiddenError('Cannot change the role of the only owner');
  }

  target.role = req.body.role;
  await target.save();
  res.json({ member: { _id: target.id, role: target.role, userId: target.userId } });
});

// DELETE /api/profiles/:profileId/members/:userId (owner)
export const removeMember = asyncHandler(async (req, res) => {
  const target = await Membership.findOne({ profileId: req.profile.id, userId: req.params.userId });
  if (!target) throw new NotFoundError('Member not found');

  if (target.role === 'owner') {
    const owners = await Membership.countDocuments({ profileId: req.profile.id, role: 'owner' });
    if (owners <= 1) throw new ForbiddenError('Cannot remove the only owner');
  }

  await target.deleteOne();
  res.json({ ok: true });
});

// POST /api/profiles/:profileId/invites (owner)
export const createInvite = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Invite.create({
    profileId: req.profile.id,
    email,
    role,
    tokenHash,
    invitedBy: req.user.id,
    expiresAt,
    status: 'pending',
  });

  const base = clientOrigins[0] || '';
  res.status(201).json({ inviteLink: `${base}/invite/${token}`, email, role, expiresAt });
});
