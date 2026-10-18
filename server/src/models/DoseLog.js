import mongoose from 'mongoose';

const doseLogSchema = new mongoose.Schema(
  {
    medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true, index: true },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'taken', 'skipped', 'missed'], default: 'pending', index: true },
    actedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actedAt: Date,
    notifiedAt: Date,
  },
  { timestamps: true }
);

doseLogSchema.index({ medicationId: 1, scheduledAt: 1 }, { unique: true });
doseLogSchema.index({ status: 1, scheduledAt: 1 });

export const DoseLog = mongoose.model('DoseLog', doseLogSchema);
