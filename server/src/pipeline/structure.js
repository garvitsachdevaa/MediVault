import { geminiConfigured } from '../config/gemini.js';
import { geminiStructure } from './extractors/gemini.js';
import { ruleBased } from './extractors/ruleBased.js';
import { prescriptionSchema, labSchema } from './schemas/extraction.schemas.js';

// Try Gemini first (if a key is set); on any failure (invalid JSON, API/quota
// error, validation error) fall back to the rule-based parser so a document is
// never lost — it just comes through flagged low-confidence.
export const structureDocument = async ({ kind, method, rawText, imageBase64, mimeType }) => {
  if (geminiConfigured()) {
    try {
      const data = await geminiStructure({
        kind,
        text: rawText,
        imageBase64: method === 'vision' ? imageBase64 : undefined,
        mimeType,
      });
      return { data, source: 'gemini' };
    } catch (err) {
      // Log the reason so a misconfigured key/model is visible in server logs,
      // then fall through to the rule-based parser (a document is never lost).
      console.warn(`[gemini] structuring failed, using rule-based fallback: ${err?.message || err}`);
    }
  } else {
    console.warn('[gemini] GEMINI_API_KEY not set — using rule-based fallback');
  }
  const schema = kind === 'lab_report' ? labSchema : prescriptionSchema;
  return { data: schema.parse(ruleBased(kind, rawText || '')), source: 'rule_fallback' };
};
