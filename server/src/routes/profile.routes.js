import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProfileAccess } from '../middleware/profileAccess.js';
import { validate } from '../middleware/validate.js';
import { uploadSingle } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimits.js';
import {
  createProfileSchema,
  updateProfileSchema,
  updateSummarySchema,
  createInviteSchema,
  updateMemberRoleSchema,
} from '../validators/profile.validators.js';
import { documentCreateSchema } from '../validators/document.validators.js';
import * as ctrl from '../controllers/profile.controller.js';
import * as docCtrl from '../controllers/document.controller.js';
import * as commentCtrl from '../controllers/comment.controller.js';
import * as medCtrl from '../controllers/medication.controller.js';
import * as resultCtrl from '../controllers/result.controller.js';
import * as timelineCtrl from '../controllers/timeline.controller.js';
import * as visitCtrl from '../controllers/visit.controller.js';
import * as shareCtrl from '../controllers/share.controller.js';
import * as homeCtrl from '../controllers/home.controller.js';

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

// Documents (list + upload). uploadSingle (multer) runs before validate so the
// multipart `kind` text field is available on req.body.
router.get('/:profileId/documents', requireProfileAccess('viewer'), docCtrl.listDocuments);
router.post(
  '/:profileId/documents',
  requireProfileAccess('caregiver'),
  uploadLimiter,
  uploadSingle,
  validate({ body: documentCreateSchema }),
  docCtrl.createDocument
);

// Profile photo upload.
router.post(
  '/:profileId/photo',
  requireProfileAccess('caregiver'),
  uploadLimiter,
  uploadSingle,
  ctrl.uploadProfilePhoto
);

// Comments (anyone with access can read + post).
router.get('/:profileId/comments', requireProfileAccess('viewer'), commentCtrl.listComments);
router.post('/:profileId/comments', requireProfileAccess('viewer'), commentCtrl.createComment);

// Medicines & today's doses.
router.get('/:profileId/medications', requireProfileAccess('viewer'), medCtrl.listMedications);
router.get('/:profileId/doses/today', requireProfileAccess('viewer'), medCtrl.getTodayDoses);

// Results: lab trends + home readings.
router.get('/:profileId/results/tests', requireProfileAccess('viewer'), resultCtrl.getTests);
router.get('/:profileId/results/series', requireProfileAccess('viewer'), resultCtrl.getSeries);
router.post('/:profileId/results/home', requireProfileAccess('caregiver'), resultCtrl.logHomeReading);
router.delete('/:profileId/results/home/:id', requireProfileAccess('caregiver'), resultCtrl.deleteHomeReading);

router.get('/:profileId/timeline', requireProfileAccess('viewer'), timelineCtrl.getTimeline);

router.get('/:profileId/visits', requireProfileAccess('viewer'), visitCtrl.listVisits);
router.post('/:profileId/visits', requireProfileAccess('caregiver'), visitCtrl.createVisit);

router.get('/:profileId/shares', requireProfileAccess('viewer'), shareCtrl.listShares);
router.post('/:profileId/shares', requireProfileAccess('caregiver'), shareCtrl.createShare);

router.get('/:profileId/home', requireProfileAccess('viewer'), homeCtrl.getHome);

export default router;
