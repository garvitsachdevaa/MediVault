import NodeCache from 'node-cache';

// 60-second cache for computed results/summaries, keyed by profile.
// useClones:false — cached payloads are read-only (served straight to res.json),
// so we skip node-cache's deep clone. Cloning also *breaks* on Mongoose documents
// (it reaches into internal state and throws), so this is correctness, not just speed.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false });

export const cacheGet = (key) => cache.get(key);
export const cacheSet = (key, value) => cache.set(key, value);

// Invalidate everything for a profile (on confirm, home reading, delete).
export const invalidateProfile = (profileId) => {
  const prefix = `profile:${profileId}:`;
  cache.keys().forEach((k) => {
    if (k.startsWith(prefix)) cache.del(k);
  });
};
