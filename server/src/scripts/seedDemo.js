// Seed clearly-labelled demo data so the trend charts, medicines and visits look
// meaningful in a demo. Safety: refuses to run unless --confirm is passed.
//
//   npm run seed:demo -- --confirm
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { HealthProfile } from '../models/HealthProfile.js';
import { Membership } from '../models/Membership.js';
import { Prescription } from '../models/Prescription.js';
import { Medication } from '../models/Medication.js';
import { LabResult } from '../models/LabResult.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { Visit } from '../models/Visit.js';
import { scheduleDosesForMedication } from '../services/doseScheduler.js';

if (!process.argv.includes('--confirm')) {
  console.error('Refusing to seed without --confirm. Run: npm run seed:demo -- --confirm');
  process.exit(1);
}

const DEMO_EMAIL = 'demo@medivault.app';
const DEMO_PASSWORD = 'Demo@12345';
const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const run = async () => {
  await connectDb();

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = new User({ name: 'Demo User', email: DEMO_EMAIL });
    await user.setPassword(DEMO_PASSWORD);
    await user.save();
  }

  // Clear previous demo profiles for a clean reseed.
  const old = await Membership.find({ userId: user._id }).populate('profileId');
  for (const m of old) {
    if (m.profileId?.name?.startsWith('Demo')) {
      const pid = m.profileId._id;
      await Promise.all([
        LabResult.deleteMany({ profileId: pid }),
        Medication.deleteMany({ profileId: pid }),
        Prescription.deleteMany({ profileId: pid }),
        Visit.deleteMany({ profileId: pid }),
        TimelineEvent.deleteMany({ profileId: pid }),
        Membership.deleteMany({ profileId: pid }),
        HealthProfile.deleteOne({ _id: pid }),
      ]);
    }
  }

  const profile = await HealthProfile.create({
    name: 'Demo – Mom',
    relation: 'mother',
    dateOfBirth: new Date('1968-04-12'),
    bloodGroup: 'B+',
    allergies: [{ name: 'Penicillin', reaction: 'Rash' }],
    conditions: [{ name: 'Type 2 Diabetes', since: '2016' }],
    createdBy: user._id,
  });
  await Membership.create({ profileId: profile._id, userId: user._id, role: 'owner' });

  // HbA1c trending down over 6 months (some out of range), + fasting glucose.
  const hba1c = [7.8, 7.5, 7.2, 7.0, 6.8, 6.6];
  const fbs = [160, 150, 142, 138, 128, 120];
  for (let i = 0; i < hba1c.length; i += 1) {
    const takenAt = monthsAgo(hba1c.length - 1 - i);
    await LabResult.create({
      profileId: profile._id, source: 'lab', testCode: 'HBA1C', displayName: 'HbA1c',
      value: hba1c[i], unit: '%', refLow: 4, refHigh: 6,
      flag: hba1c[i] > 6 ? 'high' : 'normal', takenAt,
    });
    await LabResult.create({
      profileId: profile._id, source: 'lab', testCode: 'FBS', displayName: 'Fasting Blood Sugar',
      value: fbs[i], unit: 'mg/dL', refLow: 70, refHigh: 100,
      flag: fbs[i] > 100 ? 'high' : 'normal', takenAt,
    });
    await TimelineEvent.create({
      profileId: profile._id, type: 'lab_result', title: 'Lab report',
      subtitle: `HbA1c ${hba1c[i]}%`, testCodes: ['HBA1C', 'FBS'], occurredAt: takenAt,
      searchText: 'HbA1c Fasting Blood Sugar',
    });
  }

  // One active medicine course + today's doses.
  const prescription = await Prescription.create({
    profileId: profile._id, doctorName: 'Dr. Mehta', clinic: 'City Diabetes Care', date: daysFromNow(-10),
  });
  const med = await Medication.create({
    profileId: profile._id, prescriptionId: prescription._id,
    name: 'Metformin', strength: '500mg', dose: '1 tablet', frequencyCode: 'BD',
    timesOfDay: ['09:00', '21:00'], instructions: 'After food',
    startDate: daysFromNow(-10), endDate: daysFromNow(80), durationDays: 90, status: 'active',
  });
  await scheduleDosesForMedication(med);
  await TimelineEvent.create({
    profileId: profile._id, type: 'prescription', refId: prescription._id,
    title: 'Prescription from Dr. Mehta', subtitle: '1 medicine', doctorName: 'Dr. Mehta',
    occurredAt: daysFromNow(-10), searchText: 'Dr. Mehta Metformin',
  });

  // One upcoming visit.
  const visit = await Visit.create({
    profileId: profile._id, doctorName: 'Dr. Mehta', speciality: 'Endocrinology',
    date: daysFromNow(3), reason: 'Diabetes follow-up',
  });
  await TimelineEvent.create({
    profileId: profile._id, type: 'visit', refId: visit._id, title: 'Visit — Dr. Mehta',
    subtitle: 'Endocrinology · Diabetes follow-up', doctorName: 'Dr. Mehta', occurredAt: daysFromNow(3),
    searchText: 'Dr. Mehta Endocrinology',
  });

  console.log('\nSeeded demo data.');
  console.log(`  Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log('  Profile: Demo – Mom (HbA1c trend, Metformin course, upcoming visit)\n');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
