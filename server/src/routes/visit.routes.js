import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRecordAccess } from '../middleware/recordAccess.js';
import { Visit } from '../models/Visit.js';
import * as ctrl from '../controllers/visit.controller.js';

const router = Router();
router.use(requireAuth);

router.patch('/:id', requireRecordAccess(Visit, 'caregiver', 'visit'), ctrl.updateVisit);
router.delete('/:id', requireRecordAccess(Visit, 'caregiver', 'visit'), ctrl.deleteVisit);

export default router;
