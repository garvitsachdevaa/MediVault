import { Visit } from '../models/Visit.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError } from '../utils/AppError.js';
import { parseDate } from '../utils/dates.js';

// GET /api/profiles/:profileId/visits (viewer)
export const listVisits = asyncHandler(async (req, res) => {
  const visits = await Visit.find({ profileId: req.profile.id }).sort({ date: -1 });
  res.json({ visits });
});

// POST /api/profiles/:profileId/visits (caregiver)
export const createVisit = asyncHandler(async (req, res) => {
  const date = parseDate(req.body.date);
  if (!date) throw new ValidationError('A valid visit date is required');
  const visit = await Visit.create({
    profileId: req.profile.id,
    doctorName: req.body.doctorName || null,
    speciality: req.body.speciality || null,
    date,
    reason: req.body.reason || null,
    notes: req.body.notes || null,
  });
  await TimelineEvent.create({
    profileId: req.profile.id,
    type: 'visit',
    refId: visit._id,
    title: visit.doctorName ? `Visit — ${visit.doctorName}` : 'Doctor visit',
    subtitle: [visit.speciality, visit.reason].filter(Boolean).join(' · '),
    doctorName: visit.doctorName,
    occurredAt: date,
    searchText: [visit.doctorName, visit.speciality, visit.reason].filter(Boolean).join(' '),
  });
  res.status(201).json({ visit });
});

// PATCH /api/visits/:id (caregiver)
export const updateVisit = asyncHandler(async (req, res) => {
  const visit = req.visit;
  for (const f of ['doctorName', 'speciality', 'reason', 'notes']) {
    if (f in req.body) visit[f] = req.body[f];
  }
  if (req.body.date) {
    const d = parseDate(req.body.date);
    if (d) visit.date = d;
  }
  await visit.save();
  res.json({ visit });
});

// DELETE /api/visits/:id (caregiver)
export const deleteVisit = asyncHandler(async (req, res) => {
  await TimelineEvent.deleteMany({ type: 'visit', refId: req.visit._id });
  await req.visit.deleteOne();
  res.json({ ok: true });
});
