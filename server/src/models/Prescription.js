import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    doctorName: String,
    clinic: String,
    date: Date,
  },
  { timestamps: true }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
