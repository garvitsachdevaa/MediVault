import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireDocumentAccess } from '../middleware/documentAccess.js';
import * as ctrl from '../controllers/document.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/:id', requireDocumentAccess('viewer'), ctrl.getDocument);
router.get('/:id/file-url', requireDocumentAccess('viewer'), ctrl.getDocumentFileUrl);

export default router;
