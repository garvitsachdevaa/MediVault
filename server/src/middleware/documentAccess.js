import mongoose from 'mongoose';
import { Document } from '../models/Document.js';
import { Membership } from '../models/Membership.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ForbiddenError } from '../utils/AppError.js';

const RANK = { viewer: 1, caregiver: 2, owner: 3 };

// Guards /api/documents/:id routes: loads the document, derives its profile, and
// checks the user's membership/role on that profile. 404 if not a member.
export const requireDocumentAccess = (minRole = 'viewer') =>
  asyncHandler(async (req, res, next) => {
    const id = req.params.id || req.params.documentId;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError('Document not found');

    const document = await Document.findById(id);
    if (!document) throw new NotFoundError('Document not found');

    const membership = await Membership.findOne({
      profileId: document.profileId,
      userId: req.user.id,
    });
    if (!membership) throw new NotFoundError('Document not found');
    if (RANK[membership.role] < RANK[minRole]) {
      throw new ForbiddenError('You do not have permission for this action');
    }

    req.document = document;
    req.membership = membership;
    next();
  });
