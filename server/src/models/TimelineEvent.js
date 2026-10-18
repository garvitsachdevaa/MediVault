import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    type: {
      type: String,
      enum: ['document', 'prescription', 'lab_result', 'home_reading', 'visit', 'doctor_note'],
      required: true,
    },
    refId: { type: mongoose.Schema.Types.ObjectId },
    title: String,
    subtitle: String,
    doctorName: String,
    testCodes: [String],
    occurredAt: { type: Date, default: Date.now, index: true },
    searchText: String,
  },
  { timestamps: true }
);

timelineEventSchema.index({ profileId: 1, occurredAt: -1 });
timelineEventSchema.index({ searchText: 'text' });

export const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);
