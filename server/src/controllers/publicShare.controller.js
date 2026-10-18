import { ShareLink } from '../models/ShareLink.js';
import { Document } from '../models/Document.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError, ValidationError } from '../utils/AppError.js';
import { hashToken } from '../utils/secureToken.js';
import { buildVisitSummary } from '../services/visitSummary.js';
import { signedDocumentUrl } from '../services/storage.js';
import { notifyProfileMembers } from '../services/notificationService.js';

const loadUsable = async (token) => {
  const share = await ShareLink.findOne({ tokenHash: hashToken(token) });
  if (!share || share.revokedAt || share.expiresAt < new Date()) return null;
  return share;
};

// GET /api/public/shares/:token
export const getPublicShare = asyncHandler(async (req, res) => {
  const share = await loadUsable(req.params.token);
  if (!share) throw new AppError(410, 'GONE', 'This link is no longer available');
  share.viewCount += 1;
  share.lastViewedAt = new Date();
  await share.save();
  const summary = await buildVisitSummary(share);
  res.json({ summary, expiresAt: share.expiresAt });
});

// GET /api/public/shares/:token/documents/:docId/file-url
export const getPublicShareDocUrl = asyncHandler(async (req, res) => {
  const share = await loadUsable(req.params.token);
  if (!share) throw new AppError(410, 'GONE', 'This link is no longer available');
  if (!(share.include?.documentIds || []).map(String).includes(req.params.docId)) {
    throw new AppError(403, 'FORBIDDEN', 'That document is not part of this link');
  }
  const doc = await Document.findById(req.params.docId);
  if (!doc?.storage?.publicId) throw new AppError(404, 'NOT_FOUND', 'No file for this document');
  res.json(signedDocumentUrl(doc.storage));
});

// POST /api/public/shares/:token/notes (publicNoteLimiter)
export const addPublicNote = asyncHandler(async (req, res) => {
  const share = await loadUsable(req.params.token);
  if (!share) throw new AppError(410, 'GONE', 'This link is no longer available');
  const { text, name } = req.body;
  if (!text?.trim()) throw new ValidationError('Note cannot be empty');

  const note = {
    text: text.trim().slice(0, 500),
    authorName: (name || 'A doctor').toString().slice(0, 100),
    createdAt: new Date(),
  };
  share.notes.push(note);
  await share.save();

  await TimelineEvent.create({
    profileId: share.profileId,
    type: 'doctor_note',
    title: `Note from ${note.authorName}`,
    subtitle: note.text.slice(0, 120),
    occurredAt: new Date(),
    searchText: note.text,
  });
  await notifyProfileMembers(share.profileId, {
    type: 'doctor_note',
    title: `Doctor note from ${note.authorName}`,
    body: note.text.slice(0, 100),
    link: '/app/visits',
  });

  res.status(201).json({ ok: true });
});
