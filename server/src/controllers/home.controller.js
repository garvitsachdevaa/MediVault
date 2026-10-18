import { DoseLog } from '../models/DoseLog.js';
import { Document } from '../models/Document.js';
import { Visit } from '../models/Visit.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { LabResult } from '../models/LabResult.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { startOfTodayIST, endOfTodayIST } from '../services/doseScheduler.js';
import { cacheGet, cacheSet } from '../services/cache.js';

// GET /api/profiles/:profileId/home (viewer, cached)
export const getHome = asyncHandler(async (req, res) => {
  const pid = req.profile.id;
  const key = `profile:${pid}:home`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);

  const [todayDoses, needsReview, nextVisit, recentActivity, results] = await Promise.all([
    DoseLog.find({ profileId: pid, scheduledAt: { $gte: startOfTodayIST(), $lte: endOfTodayIST() } })
      .sort({ scheduledAt: 1 })
      .populate('medicationId', 'name dose'),
    Document.countDocuments({ profileId: pid, status: 'needs_review' }),
    Visit.findOne({ profileId: pid, date: { $gte: new Date() } }).sort({ date: 1 }),
    TimelineEvent.find({ profileId: pid }).sort({ occurredAt: -1 }).limit(5),
    LabResult.find({ profileId: pid }).sort({ takenAt: -1 }),
  ]);

  const seen = new Set();
  const keyResults = [];
  for (const r of results) {
    if (seen.has(r.testCode)) continue;
    seen.add(r.testCode);
    keyResults.push({ testCode: r.testCode, displayName: r.displayName, value: r.value, unit: r.unit, flag: r.flag });
    if (keyResults.length >= 4) break;
  }

  const payload = { todayDoses, needsReview, nextVisit, recentActivity, keyResults };
  cacheSet(key, payload);
  return res.json(payload);
});
