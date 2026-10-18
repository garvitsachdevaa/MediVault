import mongoose from 'mongoose';
import { Membership } from '../models/Membership.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';

const RANK = { viewer: 1, caregiver: 2, owner: 3 };

// Generic guard for any profile-scoped record (Medication, DoseLog, Visit, ...).
// Loads the record, checks the user's membership on record.profileId, and
// attaches it to req[attach]. 404 for non-members (ids not discoverable).
export const requireRecordAccess = (Model, minRole = 'viewer', attach = 'record') =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError('Not found');
    const record = await Model.findById(id);
    if (!record) throw new NotFoundError('Not found');

    const membership = await Membership.findOne({ profileId: record.profileId, userId: req.user.id });
    if (!membership) throw new NotFoundError('Not found');
    if (RANK[membership.role] < RANK[minRole]) throw new ForbiddenError('You do not have permission for this action');

    req[attach] = record;
    req.membership = membership;
    next();
  });
