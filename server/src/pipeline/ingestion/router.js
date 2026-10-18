// Routing helpers for the extraction pipeline.

export const PDF_TEXT_MIN_CHARS_PER_PAGE = 40;

// A PDF has a usable text layer if it yields enough non-whitespace characters.
export const hasTextLayer = (text, pages = 1) =>
  (text || '').replace(/\s/g, '').length >= PDF_TEXT_MIN_CHARS_PER_PAGE * Math.max(1, pages);

// After OCR: printed (>= threshold) -> 'ocr'; low confidence -> 'vision' (Gemini
// reads the image directly, e.g. handwriting).
export const methodFromOcr = (meanConfidence, threshold) =>
  Number(meanConfidence) >= Number(threshold) ? 'ocr' : 'vision';

// Initial coarse path from the mime type (refined with real signals above).
export const decideRoute = async (doc) => {
  if (doc.mimeType === 'application/pdf') return { path: 'pdf_text', method: 'pdf_text' };
  return { path: 'image', method: 'ocr' };
};
