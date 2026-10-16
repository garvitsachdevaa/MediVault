import mongoose from 'mongoose';

// A pending invitation to join a profile. Only the SHA-256 hash of the token is
// stored; the plain token lives only in the invite link shared with the invitee.
const inviteSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['owner', 'caregiver', 'viewer'], required: true },
    tokenHash: { type: String, required: true, index: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'revoked'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Invite = mongoose.model('Invite', inviteSchema);
