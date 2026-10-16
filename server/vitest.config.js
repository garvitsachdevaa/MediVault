import { defineConfig } from 'vitest/config';

// Env values for tests only. Real secrets live in server/.env (gitignored).
// app.js validates env at import time, so required vars must exist here.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      NODE_ENV: 'test',
      MONGO_URI: 'mongodb://127.0.0.1:27017/medivault_test',
      JWT_SECRET: 'test_secret_please_change_only_for_tests',
      CLIENT_URL: 'http://localhost:5173',
    },
  },
});
