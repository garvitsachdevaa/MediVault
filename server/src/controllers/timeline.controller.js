import { TimelineEvent } from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/profiles/:profileId/timeline?type=&from=&to=&doctor=&testCode=&q=&cursor=
// Cursor pagination on (occurredAt desc, _id desc), 20 per page.
export const getTimeline = asyncHandler(async (req, res) => {
  const limit = 20;
  const { type, from, to, doctor, testCode, q, cursor } = req.query;

  const filter = { profileId: req.profile.id };
  if (type) filter.type = type;
  if (doctor) filter.doctorName = new RegExp(doctor, 'i');
  if (testCode) filter.testCodes = testCode;
  if (q) filter.searchText = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const occ = {};
  if (from) occ.$gte = new Date(from);
  if (to) occ.$lte = new Date(to);
  if (Object.keys(occ).length) filter.occurredAt = occ;

  // Keyset pagination
  if (cursor) {
    const [occStr, id] = cursor.split('__');
    const occDate = new Date(occStr);
    const after = {
      $or: [
        { occurredAt: { $lt: occDate } },
        { occurredAt: occDate, _id: { $lt: id } },
      ],
    };
    Object.assign(filter, filter.occurredAt ? { $and: [{ occurredAt: filter.occurredAt }, after] } : after);
    if (filter.occurredAt && filter.$and) delete filter.occurredAt;
  }

  const events = await TimelineEvent.find(filter)
    .sort({ occurredAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = events.length > limit;
  const page = hasMore ? events.slice(0, limit) : events;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? `${last.occurredAt.toISOString()}__${last._id}` : null;

  res.json({ events: page, nextCursor });
});
