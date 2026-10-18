import sharp from 'sharp';

// Clean up a photo/scan before OCR: auto-rotate from EXIF, greyscale, normalise
// contrast, cap the long side at 2000px, and mildly sharpen. Kept in memory only.
export const preprocess = (buffer) =>
  sharp(buffer)
    .rotate()
    .grayscale()
    .normalise()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .sharpen()
    .toBuffer();
