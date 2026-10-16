import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Membership } from '../src/models/Membership.js';
import { Invite } from '../src/models/Invite.js';
import { hashToken } from '../src/utils/secureToken.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/db.js';

beforeAll(async () => {
  await connectTestDb();
  await User.init();
  await Membership.init();
});
afterAll(async () => {
  await disconnectTestDb();
});
beforeEach(async () => {
  await clearTestDb();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

async function makeUser(email, name = 'User') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'secret123' });
  return { token: res.body.token, user: res.body.user };
}

async function setup() {
  const owner = await makeUser('owner@example.com', 'Owner');
  const created = await request(app).post('/api/profiles').set(auth(owner.token)).send({ name: 'Mom' });
  return { owner, profileId: created.body.profile._id };
}

// Invite `email` with `role` and accept it as a freshly-created matching user.
async function addMember(profileId, ownerToken, email, role) {
  const member = await makeUser(email, email);
  const inv = await request(app)
    .post(`/api/profiles/${profileId}/invites`)
    .set(auth(ownerToken))
    .send({ email, role });
  const token = inv.body.inviteLink.split('/invite/')[1];
  const acc = await request(app).post(`/api/invites/${token}/accept`).set(auth(member.token));
  return { token: member.token, user: member.user, acceptStatus: acc.status };
}

describe('profiles & access control', () => {
  it('creates a profile; creator is owner', async () => {
    const owner = await makeUser('owner@example.com');
    const res = await request(app)
      .post('/api/profiles')
      .set(auth(owner.token))
      .send({ name: 'Mom', relation: 'mother' });
    expect(res.status).toBe(201);
    expect(res.body.profile.role).toBe('owner');
    expect(res.body.profile.name).toBe('Mom');
  });

  it('lists only profiles the user belongs to', async () => {
    const a = await makeUser('a@example.com');
    const b = await makeUser('b@example.com');
    await request(app).post('/api/profiles').set(auth(a.token)).send({ name: 'A' });
    const res = await request(app).get('/api/profiles').set(auth(b.token));
    expect(res.status).toBe(200);
    expect(res.body.profiles).toHaveLength(0);
  });

  it('non-member gets 404 (ids not discoverable)', async () => {
    const { profileId } = await setup();
    const stranger = await makeUser('stranger@example.com');
    const res = await request(app).get(`/api/profiles/${profileId}`).set(auth(stranger.token));
    expect(res.status).toBe(404);
  });

  it('viewer cannot edit (403); caregiver can (200)', async () => {
    const { owner, profileId } = await setup();
    const viewer = await addMember(profileId, owner.token, 'viewer@example.com', 'viewer');
    expect(viewer.acceptStatus).toBe(201);

    const viewerEdit = await request(app)
      .patch(`/api/profiles/${profileId}`)
      .set(auth(viewer.token))
      .send({ name: 'Mum' });
    expect(viewerEdit.status).toBe(403);

    const care = await addMember(profileId, owner.token, 'care@example.com', 'caregiver');
    const careEdit = await request(app)
      .patch(`/api/profiles/${profileId}`)
      .set(auth(care.token))
      .send({ name: 'Mum' });
    expect(careEdit.status).toBe(200);
    expect(careEdit.body.profile.name).toBe('Mum');
  });

  it('viewer cannot create invites (owner-only, 403)', async () => {
    const { owner, profileId } = await setup();
    const viewer = await addMember(profileId, owner.token, 'viewer@example.com', 'viewer');
    const res = await request(app)
      .post(`/api/profiles/${profileId}/invites`)
      .set(auth(viewer.token))
      .send({ email: 'x@example.com', role: 'viewer' });
    expect(res.status).toBe(403);
  });

  it('public invite lookup returns details', async () => {
    const { owner, profileId } = await setup();
    const inv = await request(app)
      .post(`/api/profiles/${profileId}/invites`)
      .set(auth(owner.token))
      .send({ email: 'invited@example.com', role: 'viewer' });
    const token = inv.body.inviteLink.split('/invite/')[1];
    const res = await request(app).get(`/api/invites/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.invite.role).toBe('viewer');
    expect(res.body.invite.profileName).toBe('Mom');
  });

  it('accept fails for a non-matching email (403)', async () => {
    const { owner, profileId } = await setup();
    const other = await makeUser('other@example.com');
    const inv = await request(app)
      .post(`/api/profiles/${profileId}/invites`)
      .set(auth(owner.token))
      .send({ email: 'invited@example.com', role: 'viewer' });
    const token = inv.body.inviteLink.split('/invite/')[1];
    const acc = await request(app).post(`/api/invites/${token}/accept`).set(auth(other.token));
    expect(acc.status).toBe(403);
  });

  it('expired invite is rejected (404)', async () => {
    const { owner, profileId } = await setup();
    const invitee = await makeUser('invited@example.com');
    const inv = await request(app)
      .post(`/api/profiles/${profileId}/invites`)
      .set(auth(owner.token))
      .send({ email: 'invited@example.com', role: 'viewer' });
    const token = inv.body.inviteLink.split('/invite/')[1];
    await Invite.updateOne(
      { tokenHash: hashToken(token) },
      { expiresAt: new Date(Date.now() - 1000) }
    );
    const get = await request(app).get(`/api/invites/${token}`);
    expect(get.status).toBe(404);
    const acc = await request(app).post(`/api/invites/${token}/accept`).set(auth(invitee.token));
    expect(acc.status).toBe(404);
  });

  it('lists pending invites for the current user email', async () => {
    const { owner, profileId } = await setup();
    await request(app)
      .post(`/api/profiles/${profileId}/invites`)
      .set(auth(owner.token))
      .send({ email: 'invited@example.com', role: 'caregiver' });
    const invitee = await makeUser('invited@example.com');
    const res = await request(app).get('/api/invites/pending').set(auth(invitee.token));
    expect(res.status).toBe(200);
    expect(res.body.invites).toHaveLength(1);
    expect(res.body.invites[0].role).toBe('caregiver');
  });

  it('cannot remove the only owner (403)', async () => {
    const { owner, profileId } = await setup();
    const res = await request(app)
      .delete(`/api/profiles/${profileId}/members/${owner.user._id}`)
      .set(auth(owner.token));
    expect(res.status).toBe(403);
  });

  it('owner can promote a viewer to caregiver', async () => {
    const { owner, profileId } = await setup();
    const viewer = await addMember(profileId, owner.token, 'viewer@example.com', 'viewer');
    const res = await request(app)
      .patch(`/api/profiles/${profileId}/members/${viewer.user._id}`)
      .set(auth(owner.token))
      .send({ role: 'caregiver' });
    expect(res.status).toBe(200);
    expect(res.body.member.role).toBe('caregiver');
  });

  it('delete profile returns 501 for now (owner)', async () => {
    const { owner, profileId } = await setup();
    const res = await request(app).delete(`/api/profiles/${profileId}`).set(auth(owner.token));
    expect(res.status).toBe(501);
  });

  it('caregiver can update the health summary; viewer cannot', async () => {
    const { owner, profileId } = await setup();
    const care = await addMember(profileId, owner.token, 'care@example.com', 'caregiver');
    const upd = await request(app)
      .patch(`/api/profiles/${profileId}/summary`)
      .set(auth(care.token))
      .send({ allergies: [{ name: 'Penicillin', reaction: 'Rash' }] });
    expect(upd.status).toBe(200);
    expect(upd.body.profile.allergies).toHaveLength(1);
    expect(upd.body.profile.allergies[0].name).toBe('Penicillin');

    const viewer = await addMember(profileId, owner.token, 'viewer@example.com', 'viewer');
    const blocked = await request(app)
      .patch(`/api/profiles/${profileId}/summary`)
      .set(auth(viewer.token))
      .send({ allergies: [] });
    expect(blocked.status).toBe(403);

    const got = await request(app)
      .get(`/api/profiles/${profileId}/summary`)
      .set(auth(viewer.token));
    expect(got.status).toBe(200);
    expect(got.body.profile.allergies).toHaveLength(1);
    expect(got.body.currentMedications).toEqual([]);
    expect(got.body.keyResults).toEqual([]);
  });

  it('requires auth for profile routes (401)', async () => {
    const res = await request(app).get('/api/profiles');
    expect(res.status).toBe(401);
  });
});
