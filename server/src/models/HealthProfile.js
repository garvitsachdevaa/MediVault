import mongoose from 'mongoose';

const allergySchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, reaction: String, notes: String },
  { _id: true }
);
const conditionSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, since: String, notes: String },
  { _id: true }
);
const immunisationSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, date: Date, notes: String },
  { _id: true }
);

const healthProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: {
      type: String,
      enum: ['self', 'mother', 'father', 'child', 'spouse', 'other'],
      default: 'self',
    },
    dateOfBirth: Date,
    bloodGroup: String,
    photoUrl: { type: String, default: '' },
    allergies: [allergySchema],
    conditions: [conditionSchema],
    immunisations: [immunisationSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);
