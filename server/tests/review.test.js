import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { HealthProfile } from '../src/models/HealthProfile.js';
import { Membership } from '../src/models/Membership.js';
import { Document } from '../src/models/Document.js';
import { Medication } from '../src/models/Medication.js';
import { LabResult } from '../src/models/LabResult.js';
import { TimelineEvent } from '../src/models/TimelineEvent.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/db.js';

beforeAll(async () => {
  await connectTestDb();
  await User.init();
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

async function ownerWithProfile() {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Owner', email: 'owner@example.com', password: 'secret123' });
  const profile = await HealthProfile.create({ name: 'Me', relation: 'self', createdBy: reg.body.user._id });
  await Membership.create({ profileId: profile._id, userId: reg.body.user._id, role: 'owner' });
  return { token: reg.body.token, userId: reg.body.user._id, profileId: profile._id };
}

const prescriptionDraft = {
  kind: 'prescription',
  fields: {
    doctorName: { value: 'Dr. Smith', confidence: 1, flagged: false },
    clinic: { value: 'City Clinic', confidence: 1, flagged: false },
    date: { value: '2026-01-10', confidence: 1, flagged: false },
  },
  medicines: [
    {
      name: { value: 'Paracetamol', confidence: 0.9, flagged: false },
      strength: { value: '500mg', confidence: 0.9, flagged: false },
      dose: { value: '1 tab', confidence: 0.9, flagged: false },
      frequency: { value: '1-0-1', confidence: 0.9, flagged: false },
      durationDays: { value: 5, confidence: 0.9, flagged: false },
      instructions: { value: 'After food', confidence: 0.9, flagged: false },
      frequencyParsed: { code: 'BD', timesOfDay: ['09:00', '21:00'], asNeeded: false },
    },
  ],
  tests: [],
};

const labDraft = {
  kind: 'lab_report',
  fields: { date: { value: '2026-01-10', confidence: 1, flagged: false } },
  medicines: [],
  tests: [
    {
      testCode: 'HBA1C',
      displayName: { value: 'HbA1c', confidence: 1, flagged: false },
      value: { value: 7.2, confidence: 1, flagged: false },
      unit: { value: '%', confidence: 1, flagged: false },
      refLow: { value: 4, confidence: 1, flagged: false },
      refHigh: { value: 6, confidence: 1, flagged: false },
      flag: 'high',
      readAs: 'HbA1c 7.2',
    },
  ],
};

describe('review & confirm', () => {
  it('confirming a prescription creates active medications + a timeline event', async () => {
    const o = await ownerWithProfile();
    const doc = await Document.create({
      profileId: o.profileId,
      uploadedBy: o.userId,
      kind: 'prescription',
      status: 'needs_review',
      extraction: { draft: prescriptionDraft },
    });

    const res = await request(app).post(`/api/documents/${doc._id}/confirm`).set(auth(o.token));
    expect(res.status).toBe(200);
    expect(res.body.redirect).toBe('/app/medicines');

    const meds = await Medication.find({ profileId: o.profileId });
    expect(meds).toHaveLength(1);
    expect(meds[0].name).toBe('Paracetamol');
    expect(meds[0].frequencyCode).toBe('BD');
    expect(meds[0].status).toBe('active');

    const events = await TimelineEvent.find({ profileId: o.profileId, type: 'prescription' });
    expect(events).toHaveLength(1);

    const updated = await Document.findById(doc._id);
    expect(updated.status).toBe('verified');
    expect(updated.confirmedAt).toBeTruthy();
  });

  it('confirming a lab report creates lab results with computed flags', async () => {
    const o = await ownerWithProfile();
    const doc = await Document.create({
      profileId: o.profileId,
      uploadedBy: o.userId,
      kind: 'lab_report',
      status: 'needs_review',
      extraction: { draft: labDraft },
    });

    const res = await request(app).post(`/api/documents/${doc._id}/confirm`).set(auth(o.token));
    expect(res.status).toBe(200);
    expect(res.body.redirect).toBe('/app/results');

    const results = await LabResult.find({ profileId: o.profileId });
    expect(results).toHaveLength(1);
    expect(results[0].testCode).toBe('HBA1C');
    expect(results[0].flag).toBe('high');
    expect(results[0].source).toBe('lab');
  });

  it('discarding deletes the document', async () => {
    const o = await ownerWithProfile();
    const doc = await Document.create({
      profileId: o.profileId,
      uploadedBy: o.userId,
      kind: 'prescription',
      status: 'needs_review',
      extraction: { draft: prescriptionDraft },
    });
    const res = await request(app).post(`/api/documents/${doc._id}/discard`).set(auth(o.token));
    expect(res.status).toBe(200);
    expect(await Document.findById(doc._id)).toBeNull();
  });

  it('a viewer cannot confirm (403)', async () => {
    const o = await ownerWithProfile();
    const viewerReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'V', email: 'viewer@example.com', password: 'secret123' });
    await Membership.create({ profileId: o.profileId, userId: viewerReg.body.user._id, role: 'viewer' });
    const doc = await Document.create({
      profileId: o.profileId,
      uploadedBy: o.userId,
      kind: 'prescription',
      status: 'needs_review',
      extraction: { draft: prescriptionDraft },
    });
    const res = await request(app)
      .post(`/api/documents/${doc._id}/confirm`)
      .set(auth(viewerReg.body.token));
    expect(res.status).toBe(403);
  });
});
