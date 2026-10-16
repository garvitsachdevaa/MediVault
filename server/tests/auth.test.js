import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/db.js';

beforeAll(async () => {
  await connectTestDb();
  await User.init(); // build the unique email index so duplicates are caught
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
});

const valid = { name: 'Test User', email: 'test@example.com', password: 'secret123' };

describe('auth', () => {
  it('registers a user, returns a token, never leaks passwordHash', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('stores a hashed password, not the plaintext', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const doc = await User.findOne({ email: valid.email }).select('+passwordHash');
    expect(doc.passwordHash).toBeTruthy();
    expect(doc.passwordHash).not.toBe(valid.password);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE');
  });

  it('rejects a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: valid.email, password: valid.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('uses the same message for wrong password and unknown email', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: valid.email, password: 'wrongpass1' });
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever1' });
    expect(wrongPass.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPass.body.error.message).toBe('Invalid email or password');
    expect(unknown.body.error.message).toBe('Invalid email or password');
  });

  it('GET /me returns the current user with a valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send(valid);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(valid.email);
  });

  it('GET /me without a token is 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });
});
