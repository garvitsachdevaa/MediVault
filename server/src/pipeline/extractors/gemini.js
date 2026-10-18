import { Type } from '@google/genai';
import { genai, GEMINI_MODEL, geminiConfigured } from '../../config/gemini.js';
import { prescriptionSchema, labSchema } from '../schemas/extraction.schemas.js';

const RULES = `Extract ONLY what is written on the document. Return null for anything unreadable.
Never guess, infer, or add medical advice. Keep each medicine/test name exactly as written in "readAs",
and put a cleaned version in "name". Keep frequency notation as written (OD, BD, TDS, 1-0-1, SOS).`;

const PRESCRIPTION_PROMPT = `You are reading a doctor's prescription. ${RULES}`;
const LAB_PROMPT = `You are reading a laboratory report. ${RULES} For each test give the numeric value in "value" (or null) and the raw text in "valueText".`;

const PRESCRIPTION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    doctorName: { type: Type.STRING, nullable: true },
    clinic: { type: Type.STRING, nullable: true },
    date: { type: Type.STRING, nullable: true },
    notes: { type: Type.STRING, nullable: true },
    medicines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, nullable: true },
          strength: { type: Type.STRING, nullable: true },
          form: { type: Type.STRING, nullable: true },
          dose: { type: Type.STRING, nullable: true },
          frequency: { type: Type.STRING, nullable: true },
          durationDays: { type: Type.NUMBER, nullable: true },
          instructions: { type: Type.STRING, nullable: true },
          readAs: { type: Type.STRING, nullable: true },
        },
      },
    },
  },
};

const LAB_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    labName: { type: Type.STRING, nullable: true },
    date: { type: Type.STRING, nullable: true },
    tests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          readAs: { type: Type.STRING, nullable: true },
          name: { type: Type.STRING, nullable: true },
          value: { type: Type.NUMBER, nullable: true },
          valueText: { type: Type.STRING, nullable: true },
          unit: { type: Type.STRING, nullable: true },
          refLow: { type: Type.NUMBER, nullable: true },
          refHigh: { type: Type.NUMBER, nullable: true },
          refText: { type: Type.STRING, nullable: true },
        },
      },
    },
  },
};

// Structure raw text (and optionally an image, for handwriting) into validated JSON.
export const geminiStructure = async ({ kind, text, imageBase64, mimeType = 'image/png' }) => {
  if (!geminiConfigured()) throw new Error('Gemini not configured');
  const isLab = kind === 'lab_report';

  const parts = [];
  if (imageBase64) {
    parts.push({ inlineData: { data: imageBase64, mimeType } });
    if (text) parts.push({ text: `Possibly inaccurate OCR text for cross-checking:\n${text}` });
  } else {
    parts.push({ text: `Document text:\n${text || ''}` });
  }
  parts.push({ text: isLab ? LAB_PROMPT : PRESCRIPTION_PROMPT });

  const res = await genai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: isLab ? LAB_RESPONSE_SCHEMA : PRESCRIPTION_RESPONSE_SCHEMA,
      temperature: 0,
    },
  });

  const json = JSON.parse(res.text);
  return (isLab ? labSchema : prescriptionSchema).parse(json);
};
