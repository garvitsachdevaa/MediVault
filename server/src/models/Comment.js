import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    targetType: { type: String, enum: ['document', 'lab_result'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
