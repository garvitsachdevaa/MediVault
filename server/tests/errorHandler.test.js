import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('error handler', () => {
  it('returns the standard { error: { code, message } } shape for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(typeof res.body.error.message).toBe('string');
  });
});
