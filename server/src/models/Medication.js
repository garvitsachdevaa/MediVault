import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    name: { type: String, required: true },
    strength: String,
    form: String,
    dose: String,
    frequencyCode: String, // OD / BD / TDS / QID / HS / SOS / CUSTOM
    timesOfDay: [String], // e.g. ["09:00","21:00"]
    asNeeded: { type: Boolean, default: false },
    instructions: String,
    startDate: Date,
    endDate: Date,
    durationDays: Number,
    status: { type: String, enum: ['active', 'completed', 'stopped'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const Medication = mongoose.model('Medication', medicationSchema);
