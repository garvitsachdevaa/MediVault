import { LabResult } from '../models/LabResult.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError, NotFoundError } from '../utils/AppError.js';
import { computeFlag } from '../pipeline/postprocess/flags.js';
import { cacheGet, cacheSet, invalidateProfile } from '../services/cache.js';

// Default reference ranges for home readings.
const HOME = {
  BP_SYS: { refLow: 90, refHigh: 130, unit: 'mmHg', displayName: 'Blood Pressure (Systolic)' },
  BP_DIA: { refLow: 60, refHigh: 85, unit: 'mmHg', displayName: 'Blood Pressure (Diastolic)' },
  FBS: { refLow: 70, refHigh: 100, unit: 'mg/dL', displayName: 'Fasting Blood Sugar' },
  RBS: { refLow: 70, refHigh: 140, unit: 'mg/dL', displayName: 'Random Blood Sugar' },
  WEIGHT: { refLow: null, refHigh: null, unit: 'kg', displayName: 'Weight' },
};

const trendOf = (values) => {
  if (values.length < 2) return 'stable';
  const latest = values[values.length - 1].value;
  const prev = values[values.length - 2].value;
  if (prev == null || latest == null || prev === 0) return 'stable';
  const pct = (latest - prev) / Math.abs(prev);
  if (Math.abs(pct) < 0.05) return 'stable';
  return pct > 0 ? 'up' : 'down';
};

// GET /api/profiles/:profileId/results/tests (viewer)
export const getTests = asyncHandler(async (req, res) => {
  const key = `profile:${req.profile.id}:tests`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);

  const results = await LabResult.find({ profileId: req.profile.id }).sort({ takenAt: 1 });
  const byCode = {};
  for (const r of results) {
    (byCode[r.testCode] ||= { testCode: r.testCode, displayName: r.displayName, unit: r.unit, values: [] }).values.push(r);
  }
  const tests = Object.values(byCode).map((t) => {
    const latest = t.values[t.values.length - 1];
    return {
      testCode: t.testCode,
      displayName: t.displayName,
      unit: t.unit || latest.unit,
      latest: { value: latest.value, flag: latest.flag, takenAt: latest.takenAt, source: latest.source },
      count: t.values.length,
      trend: trendOf(t.values),
    };
  });
  const payload = { tests };
  cacheSet(key, payload);
  return res.json(payload);
});

// GET /api/profiles/:profileId/results/series?testCode= (viewer)
export const getSeries = asyncHandler(async (req, res) => {
  const { testCode } = req.query;
  if (!testCode) throw new ValidationError('testCode is required');
  const key = `profile:${req.profile.id}:series:${testCode}`;
  const cached = cacheGet(key);
  if (cached) return res.json(cached);

  const results = await LabResult.find({ profileId: req.profile.id, testCode }).sort({ takenAt: 1 });
  const latest = results[results.length - 1];
  const payload = {
    testCode,
    displayName: latest?.displayName || testCode,
    unit: latest?.unit || null,
    refLow: latest?.refLow ?? null,
    refHigh: latest?.refHigh ?? null,
    points: results.map((r) => ({
      _id: r._id,
      takenAt: r.takenAt,
      value: r.value,
      source: r.source,
      flag: r.flag,
      documentId: r.documentId,
    })),
  };
  cacheSet(key, payload);
  return res.json(payload);
});

// POST /api/profiles/:profileId/results/home (caregiver)
export const logHomeReading = asyncHandler(async (req, res) => {
  const { type, takenAt } = req.body;
  const when = takenAt ? new Date(takenAt) : new Date();
  const created = [];

  const add = async (code, value) => {
    const cfg = HOME[code];
    const doc = await LabResult.create({
      profileId: req.profile.id,
      source: 'home',
      testCode: code,
      displayName: cfg.displayName,
      value: Number(value),
      unit: cfg.unit,
      refLow: cfg.refLow,
      refHigh: cfg.refHigh,
      flag: computeFlag(value, cfg.refLow, cfg.refHigh),
      takenAt: when,
    });
    created.push(doc);
  };

  if (type === 'bp') {
    if (req.body.systolic == null || req.body.diastolic == null) throw new ValidationError('Both systolic and diastolic are required');
    await add('BP_SYS', req.body.systolic);
    await add('BP_DIA', req.body.diastolic);
  } else if (type === 'sugar') {
    if (req.body.value == null) throw new ValidationError('A value is required');
    await add(req.body.fasting ? 'FBS' : 'RBS', req.body.value);
  } else if (type === 'weight') {
    if (req.body.value == null) throw new ValidationError('A value is required');
    await add('WEIGHT', req.body.value);
  } else {
    throw new ValidationError('Unknown reading type');
  }

  await TimelineEvent.create({
    profileId: req.profile.id,
    type: 'home_reading',
    title: 'Home reading',
    subtitle: created.map((c) => `${c.displayName}: ${c.value} ${c.unit}`).join(', '),
    testCodes: created.map((c) => c.testCode),
    occurredAt: when,
    searchText: created.map((c) => c.displayName).join(' '),
  });

  invalidateProfile(req.profile.id);
  res.status(201).json({ results: created });
});

// DELETE /api/profiles/:profileId/results/home/:id (caregiver)
export const deleteHomeReading = asyncHandler(async (req, res) => {
  const result = await LabResult.findOne({ _id: req.params.id, profileId: req.profile.id, source: 'home' });
  if (!result) throw new NotFoundError('Reading not found');
  await result.deleteOne();
  invalidateProfile(req.profile.id);
  res.json({ ok: true });
});
