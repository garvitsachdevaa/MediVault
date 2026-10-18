import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRecordAccess } from '../middleware/recordAccess.js';
import { Medication } from '../models/Medication.js';
import { DoseLog } from '../models/DoseLog.js';
import * as ctrl from '../controllers/medication.controller.js';

const router = Router();
router.use(requireAuth);

router.patch('/:id', requireRecordAccess(Medication, 'caregiver', 'medication'), ctrl.updateMedication);
router.get('/:id/doses', requireRecordAccess(Medication, 'viewer', 'medication'), ctrl.getMedicationDoses);

export default router;

// Separate router for /api/doses
export const doseRouter = Router();
doseRouter.use(requireAuth);
doseRouter.patch('/:id', requireRecordAccess(DoseLog, 'caregiver', 'dose'), ctrl.updateDose);
