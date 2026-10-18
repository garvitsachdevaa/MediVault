import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as fuzz from 'fuzzball';

const here = dirname(fileURLToPath(import.meta.url));
const { tests } = JSON.parse(readFileSync(join(here, '../../data/testAliases.json'), 'utf8'));

const FUZZY_THRESHOLD = 88; // token_set_ratio — same idea as the ETL dedup threshold

// Normalise a raw test name to a stable testCode + display name + usual unit.
// Exact alias match first, then fuzzball token_set_ratio.
export const normaliseTest = (rawName) => {
  const q = (rawName || '').toLowerCase().trim();
  if (!q) return { testCode: 'UNKNOWN', displayName: rawName || '', unit: null, matched: false };

  for (const t of tests) {
    if (t.displayName.toLowerCase() === q || t.aliases.includes(q)) {
      return { testCode: t.testCode, displayName: t.displayName, unit: t.unit, matched: true };
    }
  }

  let best = null;
  let bestScore = 0;
  for (const t of tests) {
    for (const cand of [t.displayName.toLowerCase(), ...t.aliases]) {
      const score = fuzz.token_set_ratio(q, cand);
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
  }
  if (best && bestScore >= FUZZY_THRESHOLD) {
    return { testCode: best.testCode, displayName: best.displayName, unit: best.unit, matched: true, score: bestScore };
  }

  const code = q.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 20);
  return { testCode: code || 'UNKNOWN', displayName: rawName, unit: null, matched: false };
};
