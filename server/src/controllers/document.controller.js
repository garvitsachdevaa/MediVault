import mongoose from 'mongoose';
import { Document } from '../models/Document.js';
import { Prescription } from '../models/Prescription.js';
import { Medication } from '../models/Medication.js';
import { LabResult } from '../models/LabResult.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError, ValidationError, NotFoundError } from '../utils/AppError.js';
import { cloudinaryConfigured } from '../config/cloudinary.js';
import { detectType } from '../pipeline/ingestion/detector.js';
import { validateFile } from '../pipeline/ingestion/validator.js';
import { uploadDocument, signedDocumentUrl, deleteAsset } from '../services/storage.js';
import { enqueueDocument } from '../pipeline/queue.js';
import { deleteDocumentCascade } from '../services/documentCascade.js';
import { scheduleDosesForMedication } from '../services/doseScheduler.js';
import { invalidateProfile } from '../services/cache.js';
import { parseDate, addDays } from '../utils/dates.js';

// POST /api/profiles/:profileId/documents (caregiver) — multipart file + kind.
export const createDocument = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured()) {
    throw new AppError(503, 'STORAGE_UNCONFIGURED', 'File storage is not configured yet.');
  }
  if (!req.file) throw new ValidationError('No file was uploaded');

  const detected = await detectType(req.file.buffer);
  const info = await validateFile(req.file.buffer, detected);
  const result = await uploadDocument(req.file.buffer, { profileId: req.profile.id });

  const document = await Document.create({
    profileId: req.profile.id,
    uploadedBy: req.user.id,
    kind: req.body.kind,
    originalName: req.file.originalname,
    mimeType: detected.mime,
    sizeBytes: req.file.size,
    storage: {
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format || detected.ext,
      pages: info.pages || result.pages || 1,
    },
    status: 'uploaded',
  });

  // Start processing in the background (one at a time via the queue).
  enqueueDocument(String(document._id));

  res.status(201).json({ document });
});

// POST /api/documents/:id/rerun (caregiver) — reset and re-queue.
export const rerunDocument = asyncHandler(async (req, res) => {
  const doc = req.document;
  doc.status = 'uploaded';
  doc.stage = 'queued';
  doc.error = undefined;
  await doc.save();
  enqueueDocument(String(doc._id));
  res.json({ document: doc });
});

// GET /api/profiles/:profileId/documents?status=&page=&limit= (viewer)
export const listDocuments = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const filter = { profileId: req.profile.id };
  if (req.query.status) filter.status = req.query.status;

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Document.countDocuments(filter),
  ]);

  res.json({ documents, total, page, limit });
});

// GET /api/documents/:id (viewer)
export const getDocument = asyncHandler(async (req, res) => {
  res.json({ document: req.document });
});

// GET /api/documents/:id/file-url (viewer) — short-lived signed URL.
export const getDocumentFileUrl = asyncHandler(async (req, res) => {
  if (!req.document.storage?.publicId) throw new NotFoundError('No file for this document');
  res.json(signedDocumentUrl(req.document.storage));
});

// GET /api/documents/:id/review (viewer) — document + draft + signed file URL.
export const getReview = asyncHandler(async (req, res) => {
  const doc = req.document;
  let fileUrl = null;
  try {
    if (doc.storage?.publicId) fileUrl = signedDocumentUrl(doc.storage).url;
  } catch {
    /* storage may be unconfigured */
  }
  res.json({ document: doc, draft: doc.extraction?.draft || null, fileUrl });
});

// PATCH /api/documents/:id/draft (caregiver) — save edited draft.
export const updateDraft = asyncHandler(async (req, res) => {
  const doc = req.document;
  if (!req.body?.draft) throw new ValidationError('No draft provided');
  doc.extraction = { ...(doc.extraction?.toObject?.() || doc.extraction || {}), draft: req.body.draft };
  doc.markModified('extraction');
  await doc.save();
  res.json({ document: doc });
});

// POST /api/documents/:id/confirm (caregiver) — turn the draft into real health
// data inside a transaction. Nothing becomes health data until this runs.
export const confirmDocument = asyncHandler(async (req, res) => {
  const doc = req.document;
  const draft = doc.extraction?.draft;
  if (!draft) throw new ValidationError('There is nothing to confirm');
  if (doc.status === 'verified') throw new ValidationError('This document is already confirmed');

  const profileId = doc.profileId;
  let redirect = '/app/records';

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (doc.kind === 'prescription') {
        const [prescription] = await Prescription.create(
          [
            {
              profileId,
              documentId: doc._id,
              doctorName: draft.fields?.doctorName?.value || null,
              clinic: draft.fields?.clinic?.value || null,
              date: parseDate(draft.fields?.date?.value),
            },
          ],
          { session }
        );

        const start = prescription.date || new Date();
        for (const m of draft.medicines || []) {
          if (!m.name?.value) continue;
          const dur = m.durationDays?.value != null ? Number(m.durationDays.value) : null;
          await Medication.create(
            [
              {
                profileId,
                prescriptionId: prescription._id,
                documentId: doc._id,
                name: m.name.value,
                strength: m.strength?.value || null,
                form: m.form?.value || null,
                dose: m.dose?.value || null,
                frequencyCode: m.frequencyParsed?.code || 'OD',
                timesOfDay: m.frequencyParsed?.timesOfDay || [],
                asNeeded: Boolean(m.frequencyParsed?.asNeeded),
                instructions: m.instructions?.value || null,
                startDate: start,
                endDate: dur ? addDays(start, dur) : null,
                durationDays: dur,
                status: 'active',
              },
            ],
            { session }
          );
        }

        await TimelineEvent.create(
          [
            {
              profileId,
              type: 'prescription',
              refId: prescription._id,
              title: prescription.doctorName ? `Prescription from ${prescription.doctorName}` : 'Prescription',
              subtitle: `${(draft.medicines || []).length} medicine(s)`,
              doctorName: prescription.doctorName,
              occurredAt: start,
              searchText: [prescription.doctorName, ...(draft.medicines || []).map((m) => m.name?.value)]
                .filter(Boolean)
                .join(' '),
            },
          ],
          { session }
        );
        redirect = '/app/medicines';
      } else {
        const takenAt = parseDate(draft.fields?.date?.value) || new Date();
        const testCodes = [];
        for (const t of draft.tests || []) {
          await LabResult.create(
            [
              {
                profileId,
                documentId: doc._id,
                source: 'lab',
                testCode: t.testCode,
                displayName: t.displayName?.value || t.testCode,
                value: t.value?.value != null ? Number(t.value.value) : null,
                unit: t.unit?.value || null,
                refLow: t.refLow?.value != null ? Number(t.refLow.value) : null,
                refHigh: t.refHigh?.value != null ? Number(t.refHigh.value) : null,
                flag: t.flag || 'unknown',
                takenAt,
                readAs: t.readAs || null,
              },
            ],
            { session }
          );
          if (t.testCode) testCodes.push(t.testCode);
        }
        await TimelineEvent.create(
          [
            {
              profileId,
              type: 'lab_result',
              refId: doc._id,
              title: 'Lab report',
              subtitle: `${(draft.tests || []).length} result(s)`,
              testCodes,
              occurredAt: takenAt,
              searchText: (draft.tests || []).map((t) => t.displayName?.value).filter(Boolean).join(' '),
            },
          ],
          { session }
        );
        redirect = '/app/results';
      }

      doc.status = 'verified';
      doc.stage = 'verified';
      doc.confirmedBy = req.user.id;
      doc.confirmedAt = new Date();
      await doc.save({ session });
    });
  } finally {
    await session.endSession();
  }

  invalidateProfile(String(profileId));

  // Create today's dose logs for the newly confirmed medicines.
  if (doc.kind === 'prescription') {
    const meds = await Medication.find({ documentId: doc._id, status: 'active' });
    for (const m of meds) {
      try {
        await scheduleDosesForMedication(m);
      } catch {
        /* dose logs are also created by the daily cron */
      }
    }
  }

  res.json({ ok: true, redirect });
});

// GET /api/documents/:id/detail (viewer) — document + its confirmed records.
export const getDocumentDetail = asyncHandler(async (req, res) => {
  const doc = req.document;
  let prescription = null;
  let medications = [];
  let labResults = [];
  if (doc.kind === 'prescription') {
    prescription = await Prescription.findOne({ documentId: doc._id });
    medications = await Medication.find({ documentId: doc._id });
  } else {
    labResults = await LabResult.find({ documentId: doc._id });
  }
  let fileUrl = null;
  try {
    if (doc.storage?.publicId) fileUrl = signedDocumentUrl(doc.storage).url;
  } catch {
    /* storage may be unconfigured */
  }
  res.json({ document: doc, prescription, medications, labResults, fileUrl });
});

// DELETE /api/documents/:id (caregiver) — cascade delete the document + derived data.
export const deleteDocument = asyncHandler(async (req, res) => {
  await deleteDocumentCascade(req.document);
  res.json({ ok: true });
});

// POST /api/documents/:id/discard (caregiver) — delete the document + its file.
export const discardDocument = asyncHandler(async (req, res) => {
  const doc = req.document;
  if (doc.storage?.publicId) {
    try {
      await deleteAsset(doc.storage);
    } catch {
      /* best effort */
    }
  }
  await doc.deleteOne();
  res.json({ ok: true });
});
