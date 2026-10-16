import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthProfile', required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['prescription', 'lab_report'], required: true },
    originalName: String,
    mimeType: String,
    sizeBytes: Number,
    storage: {
      publicId: String,
      resourceType: String,
      format: String,
      pages: Number,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'needs_review', 'verified', 'failed'],
      default: 'uploaded',
      index: true,
    },
    stage: String,
    error: String,
    // Filled by the extraction pipeline in Steps 11–14.
    extraction: {
      method: { type: String, enum: ['pdf_text', 'ocr', 'vision', 'rule_fallback'] },
      ocrMeanConfidence: Number,
      rawText: String,
      draft: mongoose.Schema.Types.Mixed,
      timings: {
        ingestMs: Number,
        ocrMs: Number,
        llmMs: Number,
        totalMs: Number,
      },
      attempts: { type: Number, default: 0 },
    },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: Date,
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
