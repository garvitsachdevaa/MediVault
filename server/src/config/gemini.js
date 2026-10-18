import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

export const geminiConfigured = () => Boolean(env.GEMINI_API_KEY);

// Client is created only when a key is present; otherwise the pipeline falls back
// to the rule-based parser.
export const genai = geminiConfigured() ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

export const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-2.0-flash';
