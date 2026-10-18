import * as fuzz from 'fuzzball';

// Base confidence per extraction method.
const BASE = { pdf_text: 0.95, vision: 0.75, rule_fallback: 0.4 };

// Score a single field 0..1 from real signals (NOT the model's own rating):
//  - base by method (ocr uses the mean OCR confidence)
//  - cross-check: value must appear in the OCR text (skip for pdf_text)
//  - validation: unparseable/implausible halves it
//  - dictionary: medicine/test not matched reduces it
// Documented here and in the README so it can be explained in a viva.
export const fieldConfidence = ({
  method,
  ocrMeanConfidence = 0,
  valueText,
  rawText,
  validationOk = true,
  inDictionary = true,
}) => {
  let c = method === 'ocr' ? Number(ocrMeanConfidence || 0) / 100 : BASE[method] ?? 0.5;

  if (method !== 'pdf_text' && valueText && rawText) {
    const pr = fuzz.partial_ratio(String(valueText).toLowerCase(), String(rawText).toLowerCase());
    if (pr < 80) c *= 0.6;
  }
  if (!validationOk) c *= 0.5;
  if (!inDictionary) c *= 0.7;

  return Math.max(0, Math.min(1, Number(c.toFixed(3))));
};

export const isFlagged = (confidence, threshold) => confidence < threshold;
