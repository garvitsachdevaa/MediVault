import { Document } from '../models/Document.js';
import { env } from '../config/env.js';
import { getIo } from '../sockets/index.js';
import { notifyProfileMembers } from '../services/notificationService.js';
import { downloadDocument, getPdfPageImage } from '../services/storage.js';
import { extractPdfText } from './extractors/pdfText.js';
import { preprocess } from './extractors/preprocess.js';
import { ocrImage } from './extractors/tesseract.js';
import { hasTextLayer, methodFromOcr } from './ingestion/router.js';
import { fixOcrNoise } from './postprocess/ocrNoise.js';
import { structureDocument } from './structure.js';
import { buildDraft } from './buildDraft.js';

const STAGES = {
  queued: { label: 'Queued', percent: 5 },
  reading_file: { label: 'Reading your document', percent: 25 },
  extracting_text: { label: 'Extracting text', percent: 50 },
  understanding: { label: 'Understanding it', percent: 75 },
  checking: { label: 'Checking the results', percent: 90 },
};

const emit = (doc, stage, percent) => {
  const io = getIo();
  if (io) {
    io.to(`profile:${doc.profileId}`).emit('document:progress', {
      documentId: String(doc._id),
      status: doc.status,
      stage,
      label: STAGES[stage]?.label || stage,
      percent,
    });
  }
};

const setStage = async (doc, stage) => {
  doc.status = 'processing';
  doc.stage = stage;
  await doc.save();
  emit(doc, stage, STAGES[stage]?.percent ?? 50);
};

export const processDocument = async (documentId) => {
  const doc = await Document.findById(documentId);
  if (!doc) return;

  const started = Date.now();
  const timings = {};
  try {
    await setStage(doc, 'queued');

    // 1) Read the file bytes.
    await setStage(doc, 'reading_file');
    const t0 = Date.now();
    const buffer = await downloadDocument(doc.storage);
    timings.ingestMs = Date.now() - t0;

    // 2) Extract text (PDF text layer, or OCR of images / scanned PDFs).
    await setStage(doc, 'extracting_text');
    let method;
    let rawText = '';
    let ocrMeanConfidence = null;
    let words = [];
    let imageBase64;
    const tOcr = Date.now();

    if (doc.mimeType === 'application/pdf') {
      rawText = fixOcrNoise(await extractPdfText(buffer));
      if (hasTextLayer(rawText, doc.storage?.pages || 1)) {
        method = 'pdf_text';
      } else {
        const pageImage = await getPdfPageImage(doc.storage, 1);
        const pre = await preprocess(pageImage);
        const ocr = await ocrImage(pre);
        rawText = fixOcrNoise(ocr.text);
        ocrMeanConfidence = ocr.meanConfidence;
        words = ocr.words;
        method = methodFromOcr(ocr.meanConfidence, env.OCR_CONFIDENCE_THRESHOLD);
        imageBase64 = pre.toString('base64');
      }
    } else {
      const pre = await preprocess(buffer);
      const ocr = await ocrImage(pre);
      rawText = fixOcrNoise(ocr.text);
      ocrMeanConfidence = ocr.meanConfidence;
      words = ocr.words;
      method = methodFromOcr(ocr.meanConfidence, env.OCR_CONFIDENCE_THRESHOLD);
      imageBase64 = pre.toString('base64');
    }
    timings.ocrMs = Date.now() - tOcr;

    if (env.NODE_ENV !== 'production') {
      console.log(
        `OCR done for ${doc._id}: method=${method} rss=${Math.round(process.memoryUsage().rss / 1048576)}MB`
      );
    }

    // 3) Structure (Gemini, or rule-based fallback).
    await setStage(doc, 'understanding');
    const tLlm = Date.now();
    const structured = await structureDocument({
      kind: doc.kind,
      method,
      rawText,
      imageBase64,
      mimeType: 'image/png',
    });
    timings.llmMs = Date.now() - tLlm;

    // 4) Post-process into a confidence-scored draft.
    await setStage(doc, 'checking');
    const draft = buildDraft({
      kind: doc.kind,
      data: structured.data,
      method,
      source: structured.source,
      rawText,
      ocrMeanConfidence,
      threshold: env.REVIEW_CONFIDENCE_THRESHOLD,
    });

    timings.totalMs = Date.now() - started;
    doc.extraction = {
      method: structured.source === 'rule_fallback' ? 'rule_fallback' : method,
      ocrMeanConfidence,
      rawText,
      words,
      draft,
      timings,
      attempts: (doc.extraction?.attempts || 0) + 1,
    };
    doc.status = 'needs_review';
    doc.stage = 'needs_review';
    doc.error = undefined;
    await doc.save();
    emit(doc, 'needs_review', 100);

    await notifyProfileMembers(
      doc.profileId,
      {
        type: 'document_ready',
        title: 'Document ready for review',
        body: 'A document finished processing and needs your review.',
        link: `/app/review/${doc._id}`,
      },
      { minRole: 'caregiver' }
    );
  } catch (err) {
    doc.status = 'failed';
    doc.stage = 'failed';
    doc.error = err.message;
    await doc.save();
    emit(doc, 'failed', 100);
  }
};
