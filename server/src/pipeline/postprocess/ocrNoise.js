// Fix common OCR errors in NUMERIC / dose contexts only. Never changes letters
// inside ordinary words (e.g. "SOS" stays "SOS", "Tablet" stays "Tablet").
export const fixOcrNoise = (text) => {
  if (!text) return text;
  let out = text;

  // Unit typos
  out = out.replace(/(\d)\s*rng\b/gi, '$1 mg').replace(/\brng\b/g, 'mg');
  out = out.replace(/(\d)\s*mq\b/gi, '$1 mg');
  out = out.replace(/\bm1\b/gi, 'ml');

  // Dosing notation like 1-O-1 / l-0-l -> 1-0-1
  out = out.replace(/\b[01lIoO]\s*-\s*[01lIoO]\s*-\s*[01lIoO]\b/g, (m) =>
    m.replace(/[lI]/g, '1').replace(/[oO]/g, '0')
  );

  // Letter->digit only inside number-like tokens (token must contain a real digit)
  out = out.replace(/\b[0-9OolISB]*[0-9][0-9OolISB]*\b/g, (tok) =>
    tok.replace(/[Oo]/g, '0').replace(/[lI]/g, '1').replace(/S/g, '5').replace(/B/g, '8')
  );

  return out;
};
