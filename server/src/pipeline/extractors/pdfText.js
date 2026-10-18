import { PDFParse } from 'pdf-parse';

// Extract the embedded text layer of a PDF (no OCR). Empty/short result means
// the PDF is scanned (image-only) and needs the OCR path.
export const extractPdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  if (result.text) return result.text;
  if (Array.isArray(result.pages)) return result.pages.map((p) => p.text || '').join('\n');
  return '';
};
