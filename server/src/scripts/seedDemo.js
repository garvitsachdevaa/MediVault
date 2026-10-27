// Seed a rich, clearly-labelled DEMO account so every screen and every chart is
// full for a demo / review: two users (owner + caregiver), two health profiles,
// documents, prescriptions, several medicines with real dose-adherence history,
// ten lab tests trending over six months, home readings, past + upcoming visits,
// a timeline, comments, a doctor share link and notifications.
//
// Safe + idempotent: refuses to run without --confirm, and wipes any previous
// demo data first so re-running gives a clean, identical state.
//
//   npm run seed:demo -- --confirm
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HealthProfile } from '../models/HealthProfile.js';
import { Membership } from '../models/Membership.js';
import { Prescription } from '../models/Prescription.js';
import { Medication } from '../models/Medication.js';
import { DoseLog } from '../models/DoseLog.js';
import { LabResult } from '../models/LabResult.js';
import { Document } from '../models/Document.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { Visit } from '../models/Visit.js';
import { Notification } from '../models/Notification.js';
import { Comment } from '../models/Comment.js';
import { ShareLink } from '../models/ShareLink.js';
import {
  scheduleDosesForMedication,
  startOfTodayIST,
  endOfTodayIST,
} from '../services/doseScheduler.js';
import { generateToken, hashToken } from '../utils/secureToken.js';

if (!process.argv.includes('--confirm')) {
  console.error('Refusing to seed without --confirm. Run: npm run seed:demo -- --confirm');
  process.exit(1);
}

// ---- Credentials (put these in the README) -------------------------------
const DEMO_EMAIL = 'demo@medivault.app';
const DEMO_PASSWORD = 'Demo@12345';
const CARE_EMAIL = 'priya@medivault.app';
const CARE_PASSWORD = 'Demo@12345';

// ---- Date helpers --------------------------------------------------------
const DAY = 86400000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysFromNow = (n) => new Date(Date.now() + n * DAY);
const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};
const atHour = (date, hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

// ---- Reference ranges ----------------------------------------------------
const LAB_REF = {
  HBA1C: { name: 'HbA1c', unit: '%', low: 4, high: 6 },
  FBS: { name: 'Fasting Blood Sugar', unit: 'mg/dL', low: 70, high: 100 },
  LDL: { name: 'LDL Cholesterol', unit: 'mg/dL', low: null, high: 100 },
  HDL: { name: 'HDL Cholesterol', unit: 'mg/dL', low: 40, high: 60 },
  TG: { name: 'Triglycerides', unit: 'mg/dL', low: null, high: 150 },
  CHOL: { name: 'Total Cholesterol', unit: 'mg/dL', low: null, high: 200 },
  TSH: { name: 'TSH', unit: 'mIU/L', low: 0.4, high: 4.0 },
  HB: { name: 'Hemoglobin', unit: 'g/dL', low: 12, high: 15 },
  VITD: { name: 'Vitamin D', unit: 'ng/mL', low: 30, high: 100 },
  CREAT: { name: 'Creatinine', unit: 'mg/dL', low: 0.6, high: 1.1 },
};
const HOME_REF = {
  BP_SYS: { name: 'Blood Pressure (Systolic)', unit: 'mmHg', low: 90, high: 130 },
  BP_DIA: { name: 'Blood Pressure (Diastolic)', unit: 'mmHg', low: 60, high: 85 },
  WEIGHT: { name: 'Weight', unit: 'kg', low: null, high: null },
  FBS: { name: 'Fasting Blood Sugar', unit: 'mg/dL', low: 70, high: 100 },
};
const flagFor = (v, low, high) => {
  if (low != null && v < low) return 'low';
  if (high != null && v > high) return 'high';
  return 'normal';
};

// ---- Small insert helpers ------------------------------------------------
const upsertUser = async (email, name, password) => {
  let u = await User.findOne({ email });
  if (!u) u = new User({ name, email });
  else u.name = name;
  await u.setPassword(password);
  await u.save();
  return u;
};

const addLabSeries = async (pid, code, values, dates, documentId = null) => {
  const ref = LAB_REF[code];
  const docs = [];
  for (let i = 0; i < values.length; i += 1) {
    docs.push(
      await LabResult.create({
        profileId: pid,
        documentId,
        source: 'lab',
        testCode: code,
        displayName: ref.name,
        value: values[i],
        unit: ref.unit,
        refLow: ref.low,
        refHigh: ref.high,
        flag: flagFor(values[i], ref.low, ref.high),
        takenAt: dates[i],
      })
    );
  }
  return docs;
};

const addHome = (pid, code, value, when) => {
  const r = HOME_REF[code];
  return LabResult.create({
    profileId: pid,
    source: 'home',
    testCode: code,
    displayName: r.name,
    value,
    unit: r.unit,
    refLow: r.low,
    refHigh: r.high,
    flag: flagFor(value, r.low, r.high),
    takenAt: when,
  });
};

// Build realistic dose history: mostly taken, a few skipped/missed.
const seedDoseHistory = async (med, userId, daysBack = 21) => {
  const logs = [];
  for (let d = daysBack; d >= 1; d -= 1) {
    const day = daysAgo(d);
    for (const t of med.timesOfDay || []) {
      const scheduledAt = atHour(day, t);
      const r = Math.random();
      let status = 'taken';
      if (r > 0.9) status = 'missed';
      else if (r > 0.84) status = 'skipped';
      logs.push({
        medicationId: med._id,
        profileId: med.profileId,
        scheduledAt,
        status,
        actedBy: status === 'missed' ? undefined : userId,
        actedAt: status === 'missed' ? undefined : atHour(day, t),
      });
    }
  }
  if (logs.length) await DoseLog.insertMany(logs, { ordered: false });
};

const wipeProfile = async (pid) => {
  await Promise.all([
    LabResult.deleteMany({ profileId: pid }),
    Medication.deleteMany({ profileId: pid }),
    DoseLog.deleteMany({ profileId: pid }),
    Prescription.deleteMany({ profileId: pid }),
    Document.deleteMany({ profileId: pid }),
    Visit.deleteMany({ profileId: pid }),
    TimelineEvent.deleteMany({ profileId: pid }),
    Comment.deleteMany({ profileId: pid }),
    ShareLink.deleteMany({ profileId: pid }),
    Notification.deleteMany({ profileId: pid }),
    Membership.deleteMany({ profileId: pid }),
    HealthProfile.deleteOne({ _id: pid }),
  ]);
};

const run = async () => {
  await connectDb();

  const demoUser = await upsertUser(DEMO_EMAIL, 'Demo User', DEMO_PASSWORD);
  const careUser = await upsertUser(CARE_EMAIL, 'Priya Sharma', CARE_PASSWORD);

  // Clean slate: wipe any previous demo profiles + their notifications.
  const old = await Membership.find({ userId: demoUser._id }).populate('profileId');
  for (const m of old) {
    if (m.profileId?.name?.startsWith('Demo')) await wipeProfile(m.profileId._id);
  }
  await Notification.deleteMany({ userId: { $in: [demoUser._id, careUser._id] } });

  // =======================================================================
  // PROFILE 1 — "Demo – Mom": the full showcase profile.
  // =======================================================================
  const mom = await HealthProfile.create({
    name: 'Demo – Mom',
    relation: 'mother',
    dateOfBirth: new Date('1968-04-12'),
    bloodGroup: 'B+',
    allergies: [
      { name: 'Penicillin', reaction: 'Skin rash' },
      { name: 'Sulfa drugs', reaction: 'Hives' },
    ],
    conditions: [
      { name: 'Type 2 Diabetes', since: '2016' },
      { name: 'Hypertension', since: '2019' },
      { name: 'High cholesterol', since: '2021' },
    ],
    immunisations: [
      { name: 'Influenza (annual)', date: monthsAgo(4) },
      { name: 'COVID-19 Booster', date: monthsAgo(9) },
      { name: 'Tetanus (Td)', date: new Date('2021-02-10') },
    ],
    createdBy: demoUser._id,
  });
  await Membership.create({ profileId: mom._id, userId: demoUser._id, role: 'owner' });
  await Membership.create({ profileId: mom._id, userId: careUser._id, role: 'caregiver' });

  // ---- Documents (verified; no stored file, so no dead "open file" link) ----
  const rxDoc = await Document.create({
    profileId: mom._id,
    uploadedBy: demoUser._id,
    kind: 'prescription',
    originalName: 'prescription-dr-mehta.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 148213,
    storage: { publicId: '', resourceType: 'image', format: 'pdf', pages: 1 },
    status: 'verified',
    stage: 'verified',
    extraction: { method: 'pdf_text', timings: { ingestMs: 110, ocrMs: 0, llmMs: 1620, totalMs: 1850 }, attempts: 1 },
    confirmedBy: demoUser._id,
    confirmedAt: daysAgo(40),
  });
  const labDoc = await Document.create({
    profileId: mom._id,
    uploadedBy: demoUser._id,
    kind: 'lab_report',
    originalName: 'lab-report-diabetes-lipid-panel.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 523984,
    storage: { publicId: '', resourceType: 'image', format: 'jpg', pages: 1 },
    status: 'verified',
    stage: 'verified',
    extraction: { method: 'ocr', ocrMeanConfidence: 92.4, timings: { ingestMs: 240, ocrMs: 3100, llmMs: 860, totalMs: 4200 }, attempts: 1 },
    confirmedBy: demoUser._id,
    confirmedAt: daysAgo(1),
  });
  const cbcDoc = await Document.create({
    profileId: mom._id,
    uploadedBy: careUser._id,
    kind: 'lab_report',
    originalName: 'cbc-and-thyroid-report.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 201455,
    storage: { publicId: '', resourceType: 'image', format: 'pdf', pages: 2 },
    status: 'verified',
    stage: 'verified',
    extraction: { method: 'pdf_text', timings: { ingestMs: 130, ocrMs: 0, llmMs: 1400, totalMs: 1600 }, attempts: 1 },
    confirmedBy: demoUser._id,
    confirmedAt: daysAgo(30),
  });

  // ---- Lab results: 6-month trends -------------------------------------
  const D6 = [5, 4, 3, 2, 1, 0].map(monthsAgo);
  const D3 = [4, 2, 0].map(monthsAgo);
  const hba1c = [7.8, 7.5, 7.2, 7.0, 6.8, 6.6];
  const fbs = [160, 150, 142, 138, 128, 120];
  const ldl = [165, 158, 150, 140, 132, 120];
  const hdl = [38, 40, 41, 43, 45, 46];
  const tg = [220, 210, 195, 180, 165, 150];
  const chol = [240, 232, 225, 215, 205, 196];

  const hba1cDocs = await addLabSeries(mom._id, 'HBA1C', hba1c, D6);
  const fbsDocs = await addLabSeries(mom._id, 'FBS', fbs, D6);
  const ldlDocs = await addLabSeries(mom._id, 'LDL', ldl, D6);
  const hdlDocs = await addLabSeries(mom._id, 'HDL', hdl, D6);
  const tgDocs = await addLabSeries(mom._id, 'TG', tg, D6);
  const cholDocs = await addLabSeries(mom._id, 'CHOL', chol, D6);
  await addLabSeries(mom._id, 'HB', [11.2, 11.6, 12.1], D3);
  await addLabSeries(mom._id, 'TSH', [3.4, 3.0, 2.8], D3);
  await addLabSeries(mom._id, 'VITD', [18, 24, 31], D3);
  await addLabSeries(mom._id, 'CREAT', [0.9, 0.95, 0.92], D3);

  // Attach the most recent panel to the lab document so its detail page is rich.
  const latest = (arr) => arr[arr.length - 1]._id;
  await LabResult.updateMany(
    { _id: { $in: [latest(hba1cDocs), latest(fbsDocs), latest(ldlDocs), latest(hdlDocs), latest(tgDocs), latest(cholDocs)] } },
    { documentId: labDoc._id }
  );

  // Timeline: one lab-report entry per month.
  for (let i = 0; i < D6.length; i += 1) {
    await TimelineEvent.create({
      profileId: mom._id,
      type: 'lab_result',
      refId: i === D6.length - 1 ? labDoc._id : undefined,
      title: 'Lab report',
      subtitle: `HbA1c ${hba1c[i]}% · LDL ${ldl[i]} · Total chol ${chol[i]}`,
      testCodes: ['HBA1C', 'FBS', 'LDL', 'HDL', 'TG', 'CHOL'],
      occurredAt: D6[i],
      searchText: 'HbA1c Fasting Blood Sugar LDL HDL Triglycerides Cholesterol lipid panel',
    });
  }

  // ---- Home readings: last 8 weeks -------------------------------------
  const sys = [148, 145, 142, 139, 136, 133, 131, 129];
  const dia = [95, 94, 92, 90, 88, 87, 85, 84];
  const wt = [78, 77.6, 77.1, 76.5, 76.0, 75.6, 75.1, 74.7];
  for (let w = 0; w < 8; w += 1) {
    const when = daysAgo((7 - w) * 7 + 1);
    await addHome(mom._id, 'BP_SYS', sys[w], when);
    await addHome(mom._id, 'BP_DIA', dia[w], when);
    await addHome(mom._id, 'WEIGHT', wt[w], when);
    if (w % 2 === 0) {
      await TimelineEvent.create({
        profileId: mom._id,
        type: 'home_reading',
        title: 'Home reading',
        subtitle: `BP ${sys[w]}/${dia[w]} mmHg · Weight ${wt[w]} kg`,
        testCodes: ['BP_SYS', 'BP_DIA', 'WEIGHT'],
        occurredAt: when,
        searchText: 'Blood Pressure Weight home reading',
      });
    }
  }
  // A couple of home fasting-sugar readings (same chart as lab FBS).
  await addHome(mom._id, 'FBS', 126, daysAgo(10));
  await addHome(mom._id, 'FBS', 118, daysAgo(3));

  // ---- Prescriptions + medicines ---------------------------------------
  const rx1 = await Prescription.create({
    profileId: mom._id,
    documentId: rxDoc._id,
    doctorName: 'Dr. Mehta',
    clinic: 'City Diabetes Care',
    date: daysAgo(40),
  });
  const metformin = await Medication.create({
    profileId: mom._id, prescriptionId: rx1._id, documentId: rxDoc._id,
    name: 'Metformin', strength: '500mg', form: 'tablet', dose: '1 tablet',
    frequencyCode: 'BD', timesOfDay: ['09:00', '21:00'], instructions: 'After food',
    startDate: daysAgo(40), endDate: daysFromNow(50), durationDays: 90, status: 'active',
  });
  const amlodipine = await Medication.create({
    profileId: mom._id, prescriptionId: rx1._id, documentId: rxDoc._id,
    name: 'Amlodipine', strength: '5mg', form: 'tablet', dose: '1 tablet',
    frequencyCode: 'OD', timesOfDay: ['09:00'], instructions: 'For blood pressure',
    startDate: daysAgo(40), endDate: daysFromNow(50), durationDays: 90, status: 'active',
  });

  const rx2 = await Prescription.create({
    profileId: mom._id, doctorName: 'Dr. Rao', clinic: 'HeartCare Clinic', date: daysAgo(25),
  });
  const atorvastatin = await Medication.create({
    profileId: mom._id, prescriptionId: rx2._id,
    name: 'Atorvastatin', strength: '10mg', form: 'tablet', dose: '1 tablet',
    frequencyCode: 'HS', timesOfDay: ['22:00'], instructions: 'At bedtime',
    startDate: daysAgo(25), endDate: daysFromNow(65), durationDays: 90, status: 'active',
  });

  // A finished course (shows under the "Completed" tab).
  const rx0 = await Prescription.create({
    profileId: mom._id, doctorName: 'Dr. Rao', clinic: 'HeartCare Clinic', date: daysAgo(60),
  });
  const azithro = await Medication.create({
    profileId: mom._id, prescriptionId: rx0._id,
    name: 'Azithromycin', strength: '500mg', form: 'tablet', dose: '1 tablet',
    frequencyCode: 'OD', timesOfDay: ['10:00'], instructions: 'Course for chest infection',
    startDate: daysAgo(60), endDate: daysAgo(55), durationDays: 5, status: 'completed',
  });

  await TimelineEvent.create({
    profileId: mom._id, type: 'prescription', refId: rx1._id,
    title: 'Prescription from Dr. Mehta', subtitle: 'Metformin · Amlodipine',
    doctorName: 'Dr. Mehta', occurredAt: daysAgo(40), searchText: 'Dr. Mehta Metformin Amlodipine',
  });
  await TimelineEvent.create({
    profileId: mom._id, type: 'prescription', refId: rx2._id,
    title: 'Prescription from Dr. Rao', subtitle: 'Atorvastatin',
    doctorName: 'Dr. Rao', occurredAt: daysAgo(25), searchText: 'Dr. Rao Atorvastatin cholesterol',
  });

  // Dose history + today's doses for the active courses.
  await seedDoseHistory(metformin, demoUser._id, 21);
  await seedDoseHistory(amlodipine, demoUser._id, 21);
  await seedDoseHistory(atorvastatin, careUser._id, 18);
  await seedDoseHistory(azithro, demoUser._id, 5);
  for (const med of [metformin, amlodipine, atorvastatin]) await scheduleDosesForMedication(med);

  // Mark this morning's Metformin dose as already taken, for a lively mix.
  const todayMorning = await DoseLog.findOne({
    medicationId: metformin._id,
    scheduledAt: { $gte: startOfTodayIST(), $lte: endOfTodayIST() },
  }).sort({ scheduledAt: 1 });
  if (todayMorning) {
    todayMorning.status = 'taken';
    todayMorning.actedBy = demoUser._id;
    todayMorning.actedAt = new Date();
    await todayMorning.save();
  }

  // ---- Visits: two past (with notes) + one upcoming --------------------
  const v1 = await Visit.create({
    profileId: mom._id, doctorName: 'Dr. Mehta', speciality: 'Endocrinology',
    date: daysAgo(40), reason: 'Diabetes review',
    notes: 'HbA1c 7.8%. Continue Metformin BD. Start home BP monitoring. Review in 6 weeks.',
  });
  const v2 = await Visit.create({
    profileId: mom._id, doctorName: 'Dr. Rao', speciality: 'Cardiology',
    date: daysAgo(25), reason: 'BP & cholesterol',
    notes: 'BP still high. Start Atorvastatin 10mg at night. Reduce salt. Repeat lipids in 3 months.',
  });
  const v3 = await Visit.create({
    profileId: mom._id, doctorName: 'Dr. Mehta', speciality: 'Endocrinology',
    date: daysFromNow(5), reason: 'Diabetes follow-up',
  });
  await TimelineEvent.create({
    profileId: mom._id, type: 'visit', refId: v1._id, title: 'Visit — Dr. Mehta',
    subtitle: 'Endocrinology · Diabetes review', doctorName: 'Dr. Mehta', occurredAt: daysAgo(40),
    searchText: 'Dr. Mehta Endocrinology diabetes',
  });
  await TimelineEvent.create({
    profileId: mom._id, type: 'visit', refId: v2._id, title: 'Visit — Dr. Rao',
    subtitle: 'Cardiology · BP & cholesterol', doctorName: 'Dr. Rao', occurredAt: daysAgo(25),
    searchText: 'Dr. Rao Cardiology blood pressure cholesterol',
  });
  await TimelineEvent.create({
    profileId: mom._id, type: 'visit', refId: v3._id, title: 'Visit — Dr. Mehta',
    subtitle: 'Endocrinology · Diabetes follow-up', doctorName: 'Dr. Mehta', occurredAt: daysFromNow(5),
    searchText: 'Dr. Mehta Endocrinology follow-up',
  });

  // ---- Comments (collaboration between family members) -----------------
  await Comment.create({
    profileId: mom._id, targetType: 'document', targetId: labDoc._id,
    authorId: careUser._id, text: 'Great improvement — HbA1c is down to 6.6%! 🎉',
  });
  await Comment.create({
    profileId: mom._id, targetType: 'document', targetId: labDoc._id,
    authorId: demoUser._id, text: 'Yes! Dr. Mehta is happy with the progress.',
  });

  // ---- Doctor share link (Visits → Share links) ------------------------
  const rawToken = generateToken();
  await ShareLink.create({
    profileId: mom._id, createdBy: demoUser._id, tokenHash: hashToken(rawToken),
    include: { summary: true, medicines: true, testCodes: ['HBA1C', 'LDL', 'FBS'], documentIds: [labDoc._id] },
    expiresAt: daysFromNow(14), viewCount: 3, lastViewedAt: daysAgo(2),
    notes: [{ text: 'Reviewed — glucose control improving nicely. Continue current plan.', authorName: 'Dr. Mehta', createdAt: daysAgo(2) }],
  });

  // ---- Notifications for the owner -------------------------------------
  await Notification.create({ userId: demoUser._id, profileId: mom._id, type: 'dose', title: 'Dose reminder', body: 'Metformin 500mg is due at 9:00 PM', link: '/app/medicines', read: false });
  await Notification.create({ userId: demoUser._id, profileId: mom._id, type: 'visit', title: 'Upcoming visit', body: 'Dr. Mehta (Endocrinology) in 5 days', link: '/app/visits', read: false });
  await Notification.create({ userId: demoUser._id, profileId: mom._id, type: 'comment', title: 'New comment', body: 'Priya commented on your lab report', link: `/app/records/documents/${labDoc._id}`, read: false });
  await Notification.create({ userId: demoUser._id, profileId: mom._id, type: 'result', title: 'Results updated', body: 'HbA1c improved to 6.6%', link: '/app/results', read: true });

  // =======================================================================
  // PROFILE 2 — "Demo – Dad": a lighter second profile (profile switching).
  // =======================================================================
  const dad = await HealthProfile.create({
    name: 'Demo – Dad',
    relation: 'father',
    dateOfBirth: new Date('1965-09-03'),
    bloodGroup: 'O+',
    allergies: [],
    conditions: [{ name: 'Hypertension', since: '2018' }],
    immunisations: [{ name: 'Influenza (annual)', date: monthsAgo(5) }],
    createdBy: demoUser._id,
  });
  await Membership.create({ profileId: dad._id, userId: demoUser._id, role: 'owner' });

  const dadRx = await Prescription.create({
    profileId: dad._id, doctorName: 'Dr. Rao', clinic: 'HeartCare Clinic', date: daysAgo(30),
  });
  const telmisartan = await Medication.create({
    profileId: dad._id, prescriptionId: dadRx._id,
    name: 'Telmisartan', strength: '40mg', form: 'tablet', dose: '1 tablet',
    frequencyCode: 'OD', timesOfDay: ['08:00'], instructions: 'For blood pressure',
    startDate: daysAgo(30), endDate: daysFromNow(60), durationDays: 90, status: 'active',
  });
  await seedDoseHistory(telmisartan, demoUser._id, 14);
  await scheduleDosesForMedication(telmisartan);

  await addLabSeries(dad._id, 'LDL', [150, 138, 128], D3);
  await addLabSeries(dad._id, 'CHOL', [220, 208, 198], D3);
  const dadSys = [150, 146, 143, 140, 137, 134];
  const dadDia = [96, 94, 92, 90, 89, 87];
  for (let w = 0; w < 6; w += 1) {
    const when = daysAgo((5 - w) * 7 + 1);
    await addHome(dad._id, 'BP_SYS', dadSys[w], when);
    await addHome(dad._id, 'BP_DIA', dadDia[w], when);
  }
  const dadVisit = await Visit.create({
    profileId: dad._id, doctorName: 'Dr. Rao', speciality: 'Cardiology',
    date: daysFromNow(12), reason: 'BP review',
  });
  await TimelineEvent.create({
    profileId: dad._id, type: 'prescription', refId: dadRx._id,
    title: 'Prescription from Dr. Rao', subtitle: 'Telmisartan',
    doctorName: 'Dr. Rao', occurredAt: daysAgo(30), searchText: 'Dr. Rao Telmisartan',
  });
  await TimelineEvent.create({
    profileId: dad._id, type: 'visit', refId: dadVisit._id, title: 'Visit — Dr. Rao',
    subtitle: 'Cardiology · BP review', doctorName: 'Dr. Rao', occurredAt: daysFromNow(12),
    searchText: 'Dr. Rao Cardiology blood pressure',
  });
  await Notification.create({ userId: demoUser._id, profileId: dad._id, type: 'visit', title: 'Upcoming visit', body: 'Dr. Rao (Cardiology) in 12 days', link: '/app/visits', read: false });

  // ---- Summary -----------------------------------------------------------
  const base = env.CLIENT_URL.split(',')[0].replace(/\/+$/, '');
  console.log('\n✅ Seeded rich demo data.\n');
  console.log('  ── Login (owner) ─────────────────────────────');
  console.log(`     Email:    ${DEMO_EMAIL}`);
  console.log(`     Password: ${DEMO_PASSWORD}`);
  console.log('  ── Login (family caregiver) ──────────────────');
  console.log(`     Email:    ${CARE_EMAIL}`);
  console.log(`     Password: ${CARE_PASSWORD}`);
  console.log('  ──────────────────────────────────────────────');
  console.log('  Profiles:  Demo – Mom (full)  +  Demo – Dad (lighter)');
  console.log('  Mom has:   3 prescriptions, 4 medicines (3 active + 1 completed),');
  console.log('             dose history + today\'s doses, 10 lab tests w/ 6-month trends,');
  console.log('             8 weeks of home BP/weight, 3 documents, 3 visits, comments,');
  console.log('             4 notifications and a doctor share link.');
  console.log(`  Share link: ${base}/s/${rawToken}`);
  console.log('             (read-only doctor view, expires in 14 days)\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
