import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { notifyUsers } from '../src/services/notificationService.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/db.js';

beforeAll(async () => {
  await connectTestDb();
  await User.init();
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

async function makeUser(email = 'notif@example.com') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Notif', email, password: 'secret123' });
  return { token: res.body.token, userId: res.body.user._id };
}

describe('notifications', () => {
  it('creates, lists, counts, and marks notifications read', async () => {
    const { token, userId } = await makeUser();
    const [n] = await notifyUsers([userId], { type: 'test', title: 'Test', body: 'Hello' });

    const list = await request(app).get('/api/notifications').set(auth(token));
    expect(list.status).toBe(200);
    expect(list.body.notifications).toHaveLength(1);

    const count = await request(app).get('/api/notifications/unread-count').set(auth(token));
    expect(count.body.count).toBe(1);

    const read = await request(app).patch(`/api/notifications/${n._id}/read`).set(auth(token));
    expect(read.status).toBe(200);
    expect(read.body.notification.read).toBe(true);

    const after = await request(app).get('/api/notifications/unread-count').set(auth(token));
    expect(after.body.count).toBe(0);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('marks all as read', async () => {
    const { token, userId } = await makeUser();
    await notifyUsers([userId], { title: 'A' });
    await notifyUsers([userId], { title: 'B' });
    const all = await request(app).patch('/api/notifications/read-all').set(auth(token));
    expect(all.status).toBe(200);
    const count = await request(app).get('/api/notifications/unread-count').set(auth(token));
    expect(count.body.count).toBe(0);
  });
});
