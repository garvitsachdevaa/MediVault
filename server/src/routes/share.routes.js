import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRecordAccess } from '../middleware/recordAccess.js';
import { ShareLink } from '../models/ShareLink.js';
import { revokeShare } from '../controllers/share.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/:id/revoke', requireRecordAccess(ShareLink, 'caregiver', 'share'), revokeShare);

export default router;
