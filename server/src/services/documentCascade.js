import { Prescription } from '../models/Prescription.js';
import { Medication } from '../models/Medication.js';
import { DoseLog } from '../models/DoseLog.js';
import { LabResult } from '../models/LabResult.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { Comment } from '../models/Comment.js';
import { deleteAsset } from './storage.js';

// Delete a document and everything derived from it: prescriptions, their
// medications + dose logs, lab results, timeline events, comments, and the file.
export const deleteDocumentCascade = async (doc) => {
  const prescriptions = await Prescription.find({ documentId: doc._id }).select('_id');
  const prescriptionIds = prescriptions.map((p) => p._id);

  const meds = await Medication.find({ documentId: doc._id }).select('_id');
  const medIds = meds.map((m) => m._id);

  await DoseLog.deleteMany({ medicationId: { $in: medIds } });
  await Medication.deleteMany({ documentId: doc._id });
  await Prescription.deleteMany({ documentId: doc._id });
  await LabResult.deleteMany({ documentId: doc._id });
  await TimelineEvent.deleteMany({
    $or: [{ refId: doc._id }, { refId: { $in: prescriptionIds } }],
  });
  await Comment.deleteMany({ targetType: 'document', targetId: doc._id });

  if (doc.storage?.publicId) {
    try {
      await deleteAsset(doc.storage);
    } catch {
      /* best effort */
    }
  }
  await doc.deleteOne();
};
