import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { detectType } from '../src/pipeline/ingestion/detector.js';
import { validateFile } from '../src/pipeline/ingestion/validator.js';

const makePng = (w, h) =>
  sharp({ create: { width: w, height: h, channels: 3, background: '#ffffff' } })
    .png()
    .toBuffer();

describe('ingestion: detector + validator', () => {
  it('rejects a file whose real bytes are not an allowed type', async () => {
    // Starts with "MZ" (Windows executable) — not an allowed document type.
    const fakeExe = Buffer.concat([Buffer.from([0x4d, 0x5a]), Buffer.alloc(500, 1)]);
    await expect(detectType(fakeExe)).rejects.toThrow(/Only PDF/);
  });

  it('accepts a real PNG and reports it as an image', async () => {
    const png = await makePng(300, 300);
    const detected = await detectType(png);
    expect(detected.category).toBe('image');
    const info = await validateFile(png, detected);
    expect(info.pages).toBe(1);
    expect(info.width).toBe(300);
    expect(info.height).toBe(300);
  });

  it('rejects an image that is too small to read', async () => {
    const tiny = await makePng(50, 50);
    const detected = await detectType(tiny);
    await expect(validateFile(tiny, detected)).rejects.toThrow(/too small/);
  });
});
