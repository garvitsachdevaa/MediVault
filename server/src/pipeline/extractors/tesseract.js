import { createWorker } from 'tesseract.js';

// One shared English worker, created lazily and reused across jobs (creating a
// worker is expensive and memory-heavy on the free server).
let workerPromise = null;

const getWorker = () => {
  if (!workerPromise) workerPromise = createWorker('eng');
  return workerPromise;
};

// OCR an image buffer. Returns text, the mean word confidence (0–100), and the
// words with their confidence + bounding boxes (used for source highlighting).
export const ocrImage = async (buffer) => {
  const worker = await getWorker();
  const { data } = await worker.recognize(buffer, {}, { blocks: true });
  const words = (data.words || []).map((w) => ({
    text: w.text,
    confidence: w.confidence,
    bbox: w.bbox,
  }));
  return { text: data.text || '', meanConfidence: data.confidence ?? 0, words };
};

export const terminateWorker = async () => {
  if (!workerPromise) return;
  const worker = await workerPromise;
  await worker.terminate();
  workerPromise = null;
};
