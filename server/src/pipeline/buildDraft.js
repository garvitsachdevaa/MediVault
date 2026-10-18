import { parseFrequency } from './postprocess/frequency.js';
import { normaliseTest } from './postprocess/testNormaliser.js';
import { suggestMedicine } from './postprocess/medicineSpell.js';
import { computeFlag } from './postprocess/flags.js';
import { fieldConfidence, isFlagged } from './postprocess/confidence.js';

const isValidDate = (d) => {
  if (d == null || d === '') return true; // null is allowed
  return !Number.isNaN(new Date(d).getTime());
};

// Build the review draft. Every field is { value, confidence, flagged, readAs }.
export const buildDraft = ({ kind, data, method, source, rawText, ocrMeanConfidence, threshold }) => {
  const effMethod = source === 'rule_fallback' ? 'rule_fallback' : method;

  const field = (value, { readAs, validationOk = true, inDictionary = true } = {}) => {
    const confidence = fieldConfidence({
      method: effMethod,
      ocrMeanConfidence,
      valueText: value,
      rawText,
      validationOk,
      inDictionary,
    });
    return {
      value: value ?? null,
      confidence,
      flagged: isFlagged(confidence, threshold),
      readAs: readAs ?? (value != null ? String(value) : null),
    };
  };

  if (kind === 'lab_report') {
    const tests = (data.tests || []).map((t) => {
      const norm = normaliseTest(t.name || t.readAs || '');
      const unit = t.unit || norm.unit || null;
      return {
        testCode: norm.testCode,
        displayName: field(norm.displayName, { inDictionary: norm.matched, readAs: t.readAs || t.name }),
        value: field(t.value, { validationOk: t.value != null, readAs: t.valueText || (t.value != null ? String(t.value) : null) }),
        unit: field(unit, { validationOk: Boolean(unit) }),
        refLow: field(t.refLow ?? null),
        refHigh: field(t.refHigh ?? null),
        flag: computeFlag(t.value, t.refLow, t.refHigh), // computed in code, not AI
        readAs: t.readAs || t.name || '',
      };
    });
    return {
      kind,
      fields: {
        labName: field(data.labName),
        date: field(data.date, { validationOk: isValidDate(data.date) }),
      },
      tests,
      medicines: [],
      notes: data.notes || '',
    };
  }

  const medicines = (data.medicines || []).map((m) => {
    const sug = suggestMedicine(m.name || m.readAs || '');
    return {
      name: field(sug.name, { inDictionary: sug.matched, readAs: m.readAs || m.name }),
      strength: field(m.strength ?? null),
      form: field(m.form ?? null),
      dose: field(m.dose ?? null),
      frequency: field(m.frequency ?? null),
      frequencyParsed: parseFrequency(m.frequency || ''),
      durationDays: field(m.durationDays ?? null, {
        validationOk: m.durationDays == null || Number.isFinite(Number(m.durationDays)),
      }),
      instructions: field(m.instructions ?? null),
      readAs: m.readAs || m.name || '',
    };
  });

  return {
    kind,
    fields: {
      doctorName: field(data.doctorName),
      clinic: field(data.clinic),
      date: field(data.date, { validationOk: isValidDate(data.date) }),
    },
    medicines,
    tests: [],
    notes: data.notes || '',
  };
};
