import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Medication } from '../src/models/Medication.js';
import { DoseLog } from '../src/models/DoseLog.js';
import {
  scheduleDosesForMedication,
  completeFinishedCourses,
} from '../src/services/doseScheduler.js';
import { markMissedDoses } from '../src/jobs/reminders.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/db.js';

beforeAll(async () => {
  await connectTestDb();
  await DoseLog.init(); // unique (medicationId, scheduledAt)
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
});

const makeMed = (over = {}) =>
  Medication.create({
    profileId: new mongoose.Types.ObjectId(),
    name: 'Paracetamol',
    frequencyCode: 'BD',
    timesOfDay: ['09:00', '21:00'],
    asNeeded: false,
    status: 'active',
    startDate: new Date('2026-01-01'),
    ...over,
  });

describe('dose scheduling', () => {
  it('creates one dose per time of day', async () => {
    const med = await makeMed();
    const n = await scheduleDosesForMedication(med);
    expect(n).toBe(2);
    expect(await DoseLog.countDocuments({ medicationId: med._id })).toBe(2);
  });

  it('is idempotent — no duplicates on re-run', async () => {
    const med = await makeMed();
    await scheduleDosesForMedication(med);
    await scheduleDosesForMedication(med);
    expect(await DoseLog.countDocuments({ medicationId: med._id })).toBe(2);
  });

  it('skips SOS (as-needed) medicines', async () => {
    const med = await makeMed({ asNeeded: true, timesOfDay: [], frequencyCode: 'SOS' });
    const n = await scheduleDosesForMedication(med);
    expect(n).toBe(0);
  });

  it('completes courses whose end date has passed', async () => {
    const med = await makeMed({ endDate: new Date(Date.now() - 86400000) });
    await completeFinishedCourses();
    const updated = await Medication.findById(med._id);
    expect(updated.status).toBe('completed');
  });
});

describe('missed-dose detection', () => {
  it('marks long-overdue pending doses as missed', async () => {
    const med = await makeMed();
    await DoseLog.create({
      medicationId: med._id,
      profileId: med.profileId,
      scheduledAt: new Date(Date.now() - 5 * 3600 * 1000), // 5h ago
      status: 'pending',
    });
    const n = await markMissedDoses();
    expect(n).toBe(1);
    const dose = await DoseLog.findOne({ medicationId: med._id });
    expect(dose.status).toBe('missed');
  });
});
