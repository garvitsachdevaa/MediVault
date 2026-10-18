import mongoose from 'mongoose';

const shareLinkSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    include: {
      summary: { type: Boolean, default: true },
      medicines: { type: Boolean, default: true },
      testCodes: [String],
      documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    viewCount: { type: Number, default: 0 },
    lastViewedAt: Date,
    notes: [
      {
        text: String,
        authorName: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const ShareLink = mongoose.model('ShareLink', shareLinkSchema);
