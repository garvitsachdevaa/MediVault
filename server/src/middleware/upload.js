import multer from 'multer';
import { env } from '../config/env.js';

// Files are held in memory (never written to disk) so we can inspect the bytes,
// preprocess, and stream straight to Cloudinary.
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
}).single('file');
