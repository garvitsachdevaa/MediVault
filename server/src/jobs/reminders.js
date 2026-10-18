import { DoseLog } from '../models/DoseLog.js';
import { env } from '../config/env.js';
import { notifyProfileMembers } from '../services/notificationService.js';
import { getIo } from '../sockets/index.js';

// Notify members about pending doses that are due now and not yet notified.
export const notifyDueDoses = async (now = new Date()) => {
  const due = await DoseLog.find({ status: 'pending', notifiedAt: null, scheduledAt: { $lte: now } }).populate(
    'medicationId'
  );
  for (const dose of due) {
    const med = dose.medicationId;
    if (!med) continue;
    await notifyProfileMembers(dose.profileId, {
      type: 'dose_due',
      title: `Dose due: ${med.name}${med.dose ? ` ${med.dose}` : ''}`,
      body: 'It is time for this dose.',
      link: '/app/medicines',
    });
    dose.notifiedAt = now;
    await dose.save();
    const io = getIo();
    if (io) io.to(`profile:${dose.profileId}`).emit('dose:update', dose);
  }
  return due.length;
};

// Mark long-overdue pending doses as missed and alert caregivers + owner.
export const markMissedDoses = async (now = new Date()) => {
  const cutoff = new Date(now.getTime() - env.MISSED_WINDOW_MINUTES * 60000);
  const overdue = await DoseLog.find({ status: 'pending', scheduledAt: { $lt: cutoff } }).populate('medicationId');
  for (const dose of overdue) {
    dose.status = 'missed';
    await dose.save();
    const med = dose.medicationId;
    await notifyProfileMembers(
      dose.profileId,
      {
        type: 'dose_missed',
        title: `Missed dose: ${med?.name || 'medicine'}`,
        body: 'A dose was not marked in time.',
        link: '/app/medicines',
      },
      { minRole: 'caregiver' }
    );
    const io = getIo();
    if (io) io.to(`profile:${dose.profileId}`).emit('dose:update', dose);
  }
  return overdue.length;
};
