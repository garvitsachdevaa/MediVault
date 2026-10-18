import { Medication } from '../models/Medication.js';
import { DoseLog } from '../models/DoseLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError } from '../utils/AppError.js';
import { getIo } from '../sockets/index.js';
import {
  scheduleDosesForMedication,
  startOfTodayIST,
  endOfTodayIST,
} from '../services/doseScheduler.js';

// GET /api/profiles/:profileId/medications?status=active|completed (viewer)
export const listMedications = asyncHandler(async (req, res) => {
  const filter = { profileId: req.profile.id };
  if (req.query.status) filter.status = req.query.status;
  const medications = await Medication.find(filter).sort({ createdAt: -1 });
  res.json({ medications });
});

// GET /api/profiles/:profileId/doses/today (viewer)
export const getTodayDoses = asyncHandler(async (req, res) => {
  const doses = await DoseLog.find({
    profileId: req.profile.id,
    scheduledAt: { $gte: startOfTodayIST(), $lte: endOfTodayIST() },
  })
    .sort({ scheduledAt: 1 })
    .populate('medicationId', 'name dose strength');
  res.json({ doses });
});

// PATCH /api/medications/:id (caregiver) — edit reminder times or stop the course.
export const updateMedication = asyncHandler(async (req, res) => {
  const med = req.medication;
  const { timesOfDay, status } = req.body;
  if (Array.isArray(timesOfDay)) med.timesOfDay = timesOfDay;
  if (status && ['active', 'completed', 'stopped'].includes(status)) med.status = status;
  await med.save();
  if (med.status === 'active') await scheduleDosesForMedication(med);
  res.json({ medication: med });
});

// GET /api/medications/:id/doses?from=&to= (viewer)
export const getMedicationDoses = asyncHandler(async (req, res) => {
  const filter = { medicationId: req.medication._id };
  if (req.query.from || req.query.to) {
    filter.scheduledAt = {};
    if (req.query.from) filter.scheduledAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.scheduledAt.$lte = new Date(req.query.to);
  }
  const doses = await DoseLog.find(filter).sort({ scheduledAt: 1 });
  res.json({ doses });
});

// PATCH /api/doses/:id (caregiver) — mark taken / skipped.
export const updateDose = asyncHandler(async (req, res) => {
  const dose = req.dose;
  const { status } = req.body;
  if (!['taken', 'skipped', 'pending', 'missed'].includes(status)) {
    throw new ValidationError('Invalid dose status');
  }
  dose.status = status;
  dose.actedBy = req.user.id;
  dose.actedAt = new Date();
  await dose.save();
  const io = getIo();
  if (io) io.to(`profile:${dose.profileId}`).emit('dose:update', dose);
  res.json({ dose });
});
