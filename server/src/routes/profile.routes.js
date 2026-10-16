import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProfileAccess } from '../middleware/profileAccess.js';
import { validate } from '../middleware/validate.js';
import {
  createProfileSchema,
  updateProfileSchema,
  updateSummarySchema,
  createInviteSchema,
  updateMemberRoleSchema,
} from '../validators/profile.validators.js';
import * as ctrl from '../controllers/profile.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', ctrl.getProfiles);
router.post('/', validate({ body: createProfileSchema }), ctrl.createProfile);

router.get('/:profileId', requireProfileAccess('viewer'), ctrl.getProfile);
router.patch('/:profileId', requireProfileAccess('caregiver'), validate({ body: updateProfileSchema }), ctrl.updateProfile);
router.delete('/:profileId', requireProfileAccess('owner'), ctrl.deleteProfile);

router.get('/:profileId/summary', requireProfileAccess('viewer'), ctrl.getSummary);
router.patch(
  '/:profileId/summary',
  requireProfileAccess('caregiver'),
  validate({ body: updateSummarySchema }),
  ctrl.updateSummary
);

router.get('/:profileId/members', requireProfileAccess('viewer'), ctrl.getMembers);
router.patch(
  '/:profileId/members/:userId',
  requireProfileAccess('owner'),
  validate({ body: updateMemberRoleSchema }),
  ctrl.updateMemberRole
);
router.delete('/:profileId/members/:userId', requireProfileAccess('owner'), ctrl.removeMember);

router.post(
  '/:profileId/invites',
  requireProfileAccess('owner'),
  validate({ body: createInviteSchema }),
  ctrl.createInvite
);

export default router;
