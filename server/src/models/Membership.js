import mongoose from 'mongoose';

// Links a user to a health profile with a per-profile role.
const membershipSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'caregiver', 'viewer'], required: true },
  },
  { timestamps: true }
);

membershipSchema.index({ profileId: 1, userId: 1 }, { unique: true });

export const Membership = mongoose.model('Membership', membershipSchema);
