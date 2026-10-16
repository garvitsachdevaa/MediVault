import { z } from 'zod';

// Validate environment at startup. Missing/invalid values crash with a clear
// message rather than failing deep inside a request later.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().min(1).default('http://localhost:5173'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Added in later steps — optional for now so the server runs before they exist.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),

  OCR_CONFIDENCE_THRESHOLD: z.coerce.number().default(65),
  REVIEW_CONFIDENCE_THRESHOLD: z.coerce.number().default(0.7),
  MAX_UPLOAD_MB: z.coerce.number().default(10),
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`\nInvalid or missing environment variables:\n${issues}\n`);
  console.error('Fix server/.env (see server/.env.example) and restart.\n');
  process.exit(1);
}

export const env = parsed.data;

// Allowed CORS origins, parsed from the comma-separated CLIENT_URL.
// Trailing slashes are stripped so "https://x.app/" and "https://x.app" both match
// (browsers send the Origin header without a trailing slash).
export const clientOrigins = env.CLIENT_URL.split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
