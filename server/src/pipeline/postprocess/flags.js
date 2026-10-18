// Compute low/normal/high/unknown from a value and a reference range — in our
// own code, deterministically. Never taken from the AI.
export const computeFlag = (value, refLow, refHigh) => {
  const v = Number(value);
  if (!Number.isFinite(v)) return 'unknown';
  const lo = refLow == null || refLow === '' ? null : Number(refLow);
  const hi = refHigh == null || refHigh === '' ? null : Number(refHigh);
  if (lo == null && hi == null) return 'unknown';
  if (lo != null && Number.isFinite(lo) && v < lo) return 'low';
  if (hi != null && Number.isFinite(hi) && v > hi) return 'high';
  return 'normal';
};
