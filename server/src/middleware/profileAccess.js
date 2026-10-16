import mongoose from 'mongoose';
import { Membership } from '../models/Membership.js';
import { HealthProfile } from '../models/HealthProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';

const RANK = { viewer: 1, caregiver: 2, owner: 3 };

// Guards every /api/profiles/:profileId/... route. Must run after requireAuth.
// - 404 if the user is not a member (so profile IDs are not discoverable)
// - 403 if their role is below minRole
// Sets req.profile and req.membership for the controller.
export const requireProfileAccess = (minRole = 'viewer') =>
  asyncHandler(async (req, res, next) => {
    const { profileId } = req.params;
    if (!mongoose.isValidObjectId(profileId)) throw new NotFoundError('Profile not found');

    const membership = await Membership.findOne({ profileId, userId: req.user.id });
    if (!membership) throw new NotFoundError('Profile not found');

    if (RANK[membership.role] < RANK[minRole]) {
      throw new ForbiddenError('You do not have permission for this action');
    }

    const profile = await HealthProfile.findById(profileId);
    if (!profile) throw new NotFoundError('Profile not found');

    req.profile = profile;
    req.membership = membership;
    next();
  });
