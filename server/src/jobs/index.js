import cron from 'node-cron';
import { env } from '../config/env.js';
import { scheduleDosesForAllActive, completeFinishedCourses } from '../services/doseScheduler.js';
import { notifyDueDoses, markMissedDoses } from './reminders.js';
import { remindUpcomingVisits } from './visitReminders.js';

// All jobs are idempotent. They only run while the server is awake (keep-alive ping).
export const startJobs = () => {
  const timezone = env.APP_TIMEZONE;

  // Daily at 00:05 IST — create the day's dose logs and complete finished courses.
  cron.schedule(
    '5 0 * * *',
    async () => {
      await scheduleDosesForAllActive();
      await completeFinishedCourses();
    },
    { timezone }
  );

  // Every minute — notify doses that are due now.
  cron.schedule('* * * * *', () => notifyDueDoses().catch(() => {}), { timezone });

  // Every 10 minutes — flag overdue doses as missed.
  cron.schedule('*/10 * * * *', () => markMissedDoses().catch(() => {}), { timezone });

  // Daily at 09:00 IST — remind about visits happening tomorrow.
  cron.schedule('0 9 * * *', () => remindUpcomingVisits().catch(() => {}), { timezone });

  console.log('Scheduled jobs started');
};
