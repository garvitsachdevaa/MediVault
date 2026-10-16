import { Document } from '../models/Document.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError, ValidationError, NotFoundError } from '../utils/AppError.js';
import { cloudinaryConfigured } from '../config/cloudinary.js';
import { detectType } from '../pipeline/ingestion/detector.js';
import { validateFile } from '../pipeline/ingestion/validator.js';
import { uploadDocument, signedDocumentUrl } from '../services/storage.js';

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

  res.status(201).json({ document });
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
