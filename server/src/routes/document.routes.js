import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireDocumentAccess } from '../middleware/documentAccess.js';
import * as ctrl from '../controllers/document.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/:id', requireDocumentAccess('viewer'), ctrl.getDocument);
router.get('/:id/detail', requireDocumentAccess('viewer'), ctrl.getDocumentDetail);
router.get('/:id/file-url', requireDocumentAccess('viewer'), ctrl.getDocumentFileUrl);
router.get('/:id/review', requireDocumentAccess('viewer'), ctrl.getReview);
router.delete('/:id', requireDocumentAccess('caregiver'), ctrl.deleteDocument);
router.patch('/:id/draft', requireDocumentAccess('caregiver'), ctrl.updateDraft);
router.post('/:id/confirm', requireDocumentAccess('caregiver'), ctrl.confirmDocument);
router.post('/:id/discard', requireDocumentAccess('caregiver'), ctrl.discardDocument);
router.post('/:id/rerun', requireDocumentAccess('caregiver'), ctrl.rerunDocument);

export default router;
