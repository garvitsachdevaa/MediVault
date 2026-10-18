import { HealthProfile } from '../models/HealthProfile.js';
import { Medication } from '../models/Medication.js';
import { LabResult } from '../models/LabResult.js';
import { Prescription } from '../models/Prescription.js';
import { cacheGet, cacheSet } from './cache.js';

const ageFrom = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

// Build the one-page doctor summary for a share link (cached 60s).
export const buildVisitSummary = async (share) => {
  const key = `profile:${share.profileId}:share:${share._id}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const profile = await HealthProfile.findById(share.profileId);
  if (!profile) return null;

  const summary = {
    patient: {
      name: profile.name,
      age: ageFrom(profile.dateOfBirth),
      bloodGroup: profile.bloodGroup || null,
      relation: profile.relation,
    },
    allergies: profile.allergies || [],
    conditions: profile.conditions || [],
    generatedAt: new Date().toISOString(),
    notMedicalAdvice: 'MediVault records your health information. It is not medical advice.',
  };

  if (share.include?.medicines) {
    const meds = await Medication.find({ profileId: share.profileId, status: 'active' });
    summary.medicines = meds.map((m) => ({
      name: m.name,
      dose: m.dose,
      frequency: m.frequencyCode,
      instructions: m.instructions,
    }));
  }

  if (share.include?.testCodes?.length) {
    const results = [];
    for (const code of share.include.testCodes) {
      const values = await LabResult.find({ profileId: share.profileId, testCode: code }).sort({ takenAt: 1 });
      if (!values.length) continue;
      const latest = values[values.length - 1];
      const prev = values[values.length - 2];
      let trend = 'stable';
      if (prev && prev.value && latest.value != null) {
        const pct = (latest.value - prev.value) / Math.abs(prev.value);
        trend = Math.abs(pct) < 0.05 ? 'stable' : pct > 0 ? 'up' : 'down';
      }
      results.push({
        testCode: code,
        displayName: latest.displayName,
        value: latest.value,
        unit: latest.unit,
        flag: latest.flag,
        takenAt: latest.takenAt,
        trend,
      });
    }
    summary.results = results;
  }

  const prescriptions = await Prescription.find({ profileId: share.profileId }).sort({ date: -1 }).limit(5);
  summary.prescriptions = prescriptions.map((p) => ({ doctorName: p.doctorName, date: p.date, clinic: p.clinic }));

  summary.documentIds = (share.include?.documentIds || []).map(String);

  cacheSet(key, summary);
  return summary;
};
