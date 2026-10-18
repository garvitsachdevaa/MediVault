import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as fuzz from 'fuzzball';

const here = dirname(fileURLToPath(import.meta.url));
const { names } = JSON.parse(readFileSync(join(here, '../../data/medicines.json'), 'utf8'));
const lower = names.map((n) => n.toLowerCase());

// Suggest a clean medicine name. Exact match wins; otherwise fuzzy-match against
// the dictionary (spelling aid only — not a medical reference). The original is
// kept as `readAs` by the caller.
export const suggestMedicine = (rawName) => {
  const q = (rawName || '').trim();
  if (!q) return { name: q, matched: false };

  const ql = q.toLowerCase();
  const exact = lower.indexOf(ql);
  if (exact !== -1) return { name: names[exact], matched: true, exact: true };

  const [top] = fuzz.extract(q, names, { scorer: fuzz.ratio, limit: 1 });
  if (top && top[1] >= 85) return { name: top[0], matched: true, score: top[1] };

  return { name: q, matched: false };
};
