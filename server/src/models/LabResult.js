import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    source: { type: String, enum: ['lab', 'home'], default: 'lab' },
    testCode: { type: String, required: true },
    displayName: String,
    value: Number,
    unit: String,
    refLow: Number,
    refHigh: Number,
    flag: { type: String, enum: ['low', 'normal', 'high', 'unknown'], default: 'unknown' },
    takenAt: { type: Date, default: Date.now },
    readAs: String,
  },
  { timestamps: true }
);

labResultSchema.index({ profileId: 1, testCode: 1, takenAt: 1 });

export const LabResult = mongoose.model('LabResult', labResultSchema);
