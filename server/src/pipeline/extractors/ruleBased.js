// Regex-based fallback extraction when Gemini is unavailable. Best-effort only —
// everything it produces is scored low-confidence and flagged for human review.
const DOSE = /(\d+(?:\.\d+)?)\s?(mg|ml|mcg|g|iu)\b/i;
const FREQ = /\b(od|bd|tds|qid|hs|sos|prn|qd|bid|tid|\d\s*-\s*\d\s*-\s*\d)\b/i;

export const ruleBasedPrescription = (text = '') => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const medicines = [];
  for (const line of lines) {
    const m = line.match(/\b(tab|tablet|cap|capsule|syp|syrup|inj|injection)\.?\s+([A-Za-z][A-Za-z0-9\- ]{1,40})/i);
    if (!m) continue;
    const name = m[2].trim().split(/\s{2,}/)[0].trim();
    const dose = (line.match(DOSE) || [])[0] || '';
    const dur = line.match(/(?:x|for)\s*(\d+)\s*(day|days|week|weeks)/i);
    const durationDays = dur ? (/week/i.test(dur[2]) ? Number(dur[1]) * 7 : Number(dur[1])) : null;
    const freq = line.match(FREQ);
    medicines.push({
      name,
      strength: dose || null,
      form: m[1],
      dose: dose || null,
      frequency: freq ? freq[0] : null,
      durationDays,
      instructions: null,
      readAs: line,
    });
  }
  const doctorName = (text.match(/dr\.?\s+([A-Za-z][A-Za-z .]{2,40})/i) || [])[1]?.trim() || null;
  return { doctorName, clinic: null, date: null, medicines, notes: '' };
};

export const ruleBasedLab = (text = '') => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const tests = [];
  for (const line of lines) {
    const m = line.match(
      /^([A-Za-z][A-Za-z0-9 ()/.\-]{1,40}?)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*([A-Za-z%/µ]+)?\s*(?:\(?\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*\)?)?/
    );
    if (!m || !m[2]) continue;
    tests.push({
      readAs: line,
      name: m[1].trim(),
      value: Number(m[2]),
      valueText: m[2],
      unit: m[3] || null,
      refLow: m[4] ? Number(m[4]) : null,
      refHigh: m[5] ? Number(m[5]) : null,
      refText: m[4] && m[5] ? `${m[4]}-${m[5]}` : null,
    });
  }
  return { labName: null, date: null, tests };
};

export const ruleBased = (kind, text) =>
  kind === 'lab_report' ? ruleBasedLab(text) : ruleBasedPrescription(text);
