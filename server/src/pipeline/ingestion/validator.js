import sharp from 'sharp';
import { PDFParse } from 'pdf-parse';
import { env } from '../../config/env.js';
import { ValidationError } from '../../utils/AppError.js';

const MIN_DIMENSION = 200; // px — below this an image is too small to read

// Validate the already-type-detected buffer. Returns metadata (pages, dimensions).
export const validateFile = async (buffer, detected) => {
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw new ValidationError(`File is larger than ${env.MAX_UPLOAD_MB} MB`);
  }

  if (detected.category === 'image') {
    let meta;
    try {
      meta = await sharp(buffer).metadata();
    } catch {
      throw new ValidationError('Could not read the image file');
    }
    if (!meta.width || !meta.height) throw new ValidationError('Could not read image dimensions');
    if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
      throw new ValidationError('Image is too small or low quality to read');
    }
    return { pages: 1, width: meta.width, height: meta.height };
  }

  // PDF
  let pages;
  try {
    const parser = new PDFParse({ data: buffer });
    const info = await parser.getInfo();
    pages = info.total;
  } catch {
    throw new ValidationError('Could not read the PDF file');
  }
  if (!pages || pages < 1) throw new ValidationError('The PDF has no pages');
  if (pages > 5) throw new ValidationError('The PDF has more than 5 pages');
  return { pages };
};
