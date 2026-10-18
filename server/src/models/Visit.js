import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    doctorName: String,
    speciality: String,
    date: { type: Date, required: true },
    reason: String,
    notes: String,
    reminderSentAt: Date,
  },
  { timestamps: true }
);

export const Visit = mongoose.model('Visit', visitSchema);
