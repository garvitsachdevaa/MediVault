import { describe, it, expect } from 'vitest';
import { fixOcrNoise } from '../src/pipeline/postprocess/ocrNoise.js';
import { parseFrequency } from '../src/pipeline/postprocess/frequency.js';
import { normaliseTest } from '../src/pipeline/postprocess/testNormaliser.js';
import { computeFlag } from '../src/pipeline/postprocess/flags.js';
import { fieldConfidence, isFlagged } from '../src/pipeline/postprocess/confidence.js';
import { ruleBasedPrescription, ruleBasedLab } from '../src/pipeline/extractors/ruleBased.js';
import { hasTextLayer, methodFromOcr } from '../src/pipeline/ingestion/router.js';

describe('ocrNoise', () => {
  it('fixes confusable chars inside numbers only', () => {
    expect(fixOcrNoise('5OO mg')).toBe('500 mg'); // O->0 in number
    expect(fixOcrNoise('1-O-1')).toBe('1-0-1');
    expect(fixOcrNoise('5 rng')).toBe('5 mg');
    expect(fixOcrNoise('2 m1')).toBe('2 ml');
  });
  it('never changes letters inside ordinary words', () => {
    expect(fixOcrNoise('SOS')).toBe('SOS');
    expect(fixOcrNoise('Take Tablet Before food')).toBe('Take Tablet Before food');
  });
});

describe('parseFrequency', () => {
  it('maps common notations to the right schedule', () => {
    expect(parseFrequency('OD').timesOfDay).toEqual(['09:00']);
    expect(parseFrequency('1-0-1').code).toBe('BD');
    expect(parseFrequency('1-1-1').code).toBe('TDS');
    expect(parseFrequency('TDS').timesOfDay).toHaveLength(3);
    expect(parseFrequency('QID').timesOfDay).toHaveLength(4);
    expect(parseFrequency('HS').timesOfDay).toEqual(['22:00']);
    const sos = parseFrequency('SOS');
    expect(sos.asNeeded).toBe(true);
    expect(sos.timesOfDay).toHaveLength(0);
  });
  it('handles a generic x-y-z pattern', () => {
    const r = parseFrequency('2-0-2');
    expect(r.timesOfDay).toEqual(['09:00', '21:00']);
  });
});

describe('normaliseTest', () => {
  it('maps Hb / HGB / Haemoglobin to one code', () => {
    expect(normaliseTest('Hb').testCode).toBe('HB');
    expect(normaliseTest('HGB').testCode).toBe('HB');
    expect(normaliseTest('Haemoglobin').testCode).toBe('HB');
  });
  it('maps HbA1c variants', () => {
    expect(normaliseTest('HbA1c').testCode).toBe('HBA1C');
    expect(normaliseTest('Glycated Haemoglobin').testCode).toBe('HBA1C');
  });
  it('derives a code for an unknown test and marks it unmatched', () => {
    const r = normaliseTest('Some Weird Panel');
    expect(r.matched).toBe(false);
    expect(r.testCode).toBeTruthy();
  });
});

describe('computeFlag', () => {
  it('computes low/normal/high/unknown', () => {
    expect(computeFlag(5, 10, 20)).toBe('low');
    expect(computeFlag(15, 10, 20)).toBe('normal');
    expect(computeFlag(25, 10, 20)).toBe('high');
    expect(computeFlag(10, 10, 20)).toBe('normal'); // boundary inclusive
    expect(computeFlag('abc', 10, 20)).toBe('unknown');
    expect(computeFlag(5, null, null)).toBe('unknown');
  });
});

describe('confidence', () => {
  it('scores pdf_text high and rule_fallback low', () => {
    const pdf = fieldConfidence({ method: 'pdf_text', valueText: 'Paracetamol', rawText: 'Paracetamol 500mg' });
    const rule = fieldConfidence({ method: 'rule_fallback', valueText: 'x', rawText: 'x' });
    expect(pdf).toBeGreaterThan(0.9);
    expect(rule).toBeLessThan(0.5);
    expect(isFlagged(rule, 0.7)).toBe(true);
    expect(isFlagged(pdf, 0.7)).toBe(false);
  });
  it('penalises values missing from the OCR text', () => {
    const present = fieldConfidence({ method: 'ocr', ocrMeanConfidence: 90, valueText: '500', rawText: 'dose 500 mg' });
    const absent = fieldConfidence({ method: 'ocr', ocrMeanConfidence: 90, valueText: '999', rawText: 'dose 500 mg' });
    expect(absent).toBeLessThan(present);
  });
});

describe('rule-based parser', () => {
  it('extracts a medicine line', () => {
    const r = ruleBasedPrescription('Tab Paracetamol 500mg 1-0-1 x 5 days');
    expect(r.medicines).toHaveLength(1);
    expect(r.medicines[0].name.toLowerCase()).toContain('paracetamol');
    expect(r.medicines[0].durationDays).toBe(5);
  });
  it('extracts a lab line', () => {
    const r = ruleBasedLab('Haemoglobin 13.5 g/dL 12-16');
    expect(r.tests).toHaveLength(1);
    expect(r.tests[0].value).toBe(13.5);
    expect(r.tests[0].refLow).toBe(12);
    expect(r.tests[0].refHigh).toBe(16);
  });
});

describe('routing', () => {
  it('detects a usable text layer', () => {
    expect(hasTextLayer('a'.repeat(100), 1)).toBe(true);
    expect(hasTextLayer('   ', 1)).toBe(false);
  });
  it('routes by OCR confidence threshold', () => {
    expect(methodFromOcr(80, 65)).toBe('ocr');
    expect(methodFromOcr(40, 65)).toBe('vision');
  });
});
