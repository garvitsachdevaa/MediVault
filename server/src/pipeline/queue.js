import pLimit from 'p-limit';
import { Document } from '../models/Document.js';
import { processDocument } from './orchestrator.js';

// Process one document at a time to protect memory on the free server.
const limit = pLimit(1);

export const enqueueDocument = (documentId) => limit(() => processDocument(documentId));

// On server start, re-queue anything left mid-flight by a restart.
export const requeueStuck = async () => {
  const stuck = await Document.find({ status: { $in: ['uploaded', 'processing'] } }).select('_id');
  stuck.forEach((d) => {
    enqueueDocument(String(d._id));
  });
  if (stuck.length) console.log(`Re-queued ${stuck.length} document(s) after restart`);
};
