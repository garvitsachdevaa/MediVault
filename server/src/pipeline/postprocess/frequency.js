// Parse a written frequency into a structured schedule.
// Returns { code, timesPerDay, timesOfDay, asNeeded }.
const PRESETS = {
  OD: ['09:00'],
  BD: ['09:00', '21:00'],
  TDS: ['08:00', '14:00', '20:00'],
  QID: ['08:00', '12:00', '16:00', '20:00'],
  HS: ['22:00'],
  SOS: [],
};

const mk = (code) => ({
  code,
  timesOfDay: PRESETS[code],
  timesPerDay: PRESETS[code].length,
  asNeeded: code === 'SOS',
});

export const parseFrequency = (raw) => {
  const s = (raw || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!s) return mk('OD');

  const has = (...kw) => kw.some((k) => s.includes(k));

  if (has('sos', 'prn', 'as needed', 'as required')) return mk('SOS');
  if (has('qid', 'four times')) return mk('QID');
  if (/\b1-?1-?1\b/.test(s) || has('tds', 'tid', 'thrice daily', 'three times')) return mk('TDS');
  if (/\b1-?0-?1\b/.test(s) || has('bd', 'bid', 'twice daily', 'twice a day', 'two times')) return mk('BD');
  if (/\b0-?0-?1\b/.test(s) || has('hs', 'at bedtime', 'bedtime', 'at night')) return mk('HS');
  if (/\b1-?0-?0\b/.test(s) || has('od', 'qd', 'once daily', 'once a day', 'morning only')) return mk('OD');

  // Generic x-y-z pattern -> morning / afternoon / night for nonzero slots.
  const m = s.match(/(\d)\s*-\s*(\d)\s*-\s*(\d)/);
  if (m) {
    const slots = [
      ['09:00', Number(m[1])],
      ['14:00', Number(m[2])],
      ['21:00', Number(m[3])],
    ];
    const timesOfDay = slots.filter(([, n]) => n > 0).map(([t]) => t);
    if (timesOfDay.length) {
      return { code: 'CUSTOM', timesOfDay, timesPerDay: timesOfDay.length, asNeeded: false };
    }
  }

  return mk('OD');
};
