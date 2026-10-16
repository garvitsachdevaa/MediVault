import { fileTypeFromBuffer } from 'file-type';
import { UnsupportedFormatError } from '../../utils/AppError.js';

// Allowed types, keyed by the REAL mime detected from the file's bytes.
const ALLOWED = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
};

// Detect the true type from the bytes (not the extension or client-sent mime),
// so a renamed .exe pretending to be .pdf is rejected.
export const detectType = async (buffer) => {
  const ft = await fileTypeFromBuffer(buffer);
  if (!ft || !ALLOWED[ft.mime]) {
    throw new UnsupportedFormatError('Only PDF, JPEG, PNG or WEBP files are allowed');
  }
  return { mime: ft.mime, ext: ft.ext, category: ALLOWED[ft.mime] };
};
