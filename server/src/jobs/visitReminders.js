import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { env } from '../config/env.js';
import { Visit } from '../models/Visit.js';
import { notifyProfileMembers } from '../services/notificationService.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Notify members about visits happening tomorrow. reminderSentAt prevents repeats.
export const remindUpcomingVisits = async (now = new Date()) => {
  const tz = env.APP_TIMEZONE;
  const start = dayjs(now).tz(tz).add(1, 'day').startOf('day').utc().toDate();
  const end = dayjs(now).tz(tz).add(1, 'day').endOf('day').utc().toDate();

  const visits = await Visit.find({ date: { $gte: start, $lte: end }, reminderSentAt: null });
  for (const v of visits) {
    await notifyProfileMembers(v.profileId, {
      type: 'visit_reminder',
      title: `Visit tomorrow${v.doctorName ? ` — ${v.doctorName}` : ''}`,
      body: [v.speciality, v.reason].filter(Boolean).join(' · ') || 'You have a visit tomorrow.',
      link: '/app/visits',
    });
    v.reminderSentAt = new Date();
    await v.save();
  }
  return visits.length;
};
