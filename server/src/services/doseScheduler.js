import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { env } from '../config/env.js';
import { Medication } from '../models/Medication.js';
import { DoseLog } from '../models/DoseLog.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = env.APP_TIMEZONE;

export const startOfTodayIST = () => dayjs().tz(TZ).startOf('day').utc().toDate();
export const endOfTodayIST = () => dayjs().tz(TZ).endOf('day').utc().toDate();

// Create today's DoseLogs for one active, non-SOS medication. Times are resolved
// in APP_TIMEZONE and stored as UTC. Upsert on (medicationId, scheduledAt) so it
// is safe to run repeatedly (no duplicates).
export const scheduleDosesForMedication = async (med, forDate = new Date()) => {
  if (med.status !== 'active' || med.asNeeded || !med.timesOfDay?.length) return 0;

  const day = dayjs(forDate).tz(TZ);
  let count = 0;
  for (const hhmm of med.timesOfDay) {
    const [h, m] = String(hhmm).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;
    const scheduled = day.hour(h).minute(m).second(0).millisecond(0);
    if (med.startDate && scheduled.toDate() < dayjs(med.startDate).tz(TZ).startOf('day').toDate()) continue;
    if (med.endDate && scheduled.toDate() > dayjs(med.endDate).tz(TZ).endOf('day').toDate()) continue;
    const scheduledAt = scheduled.utc().toDate();
    await DoseLog.updateOne(
      { medicationId: med._id, scheduledAt },
      { $setOnInsert: { medicationId: med._id, profileId: med.profileId, scheduledAt, status: 'pending' } },
      { upsert: true }
    );
    count += 1;
  }
  return count;
};

export const scheduleDosesForAllActive = async (forDate = new Date()) => {
  const meds = await Medication.find({ status: 'active', asNeeded: false });
  let total = 0;
  for (const med of meds) total += await scheduleDosesForMedication(med, forDate);
  return total;
};

// Mark medicines whose course has ended as completed.
export const completeFinishedCourses = async (now = new Date()) =>
  Medication.updateMany({ status: 'active', endDate: { $ne: null, $lt: now } }, { status: 'completed' });
