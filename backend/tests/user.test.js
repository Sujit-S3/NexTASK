const request = require('supertest');
const app = require('../app');
const db = require('./db');
const { registerUser, registerAdmin } = require('./helpers');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

const authed = (token) => (req) => req.set('Authorization', `Bearer ${token}`);

describe('GET /api/users', () => {
  it('403s for a non-admin', async () => {
    const { token } = await registerUser();
    const res = await authed(token)(request(app).get('/api/users'));
    expect(res.status).toBe(403);
  });

  it('lists users for an admin', async () => {
    const { token } = await registerAdmin();
    await registerUser();
    const res = await authed(token)(request(app).get('/api/users'));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe('POST /api/users', () => {
  it('403s for a non-admin', async () => {
    const { token } = await registerUser();
    const res = await authed(token)(request(app).post('/api/users')).send({
      name: 'New Guy',
      email: 'newguy@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(403);
  });

  it('lets an admin create a user', async () => {
    const { token } = await registerAdmin();
    const res = await authed(token)(request(app).post('/api/users')).send({
      name: 'New Guy',
      email: 'newguy2@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('newguy2@example.com');
  });

  it('409s on a duplicate email', async () => {
    const { token } = await registerAdmin();
    const { email } = await registerUser();

    const res = await authed(token)(request(app).post('/api/users')).send({
      name: 'Dup',
      email,
      password: 'Password123',
    });
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/users/:id', () => {
  it('lets a user update their own profile', async () => {
    const { token, user } = await registerUser();
    const res = await authed(token)(request(app).put(`/api/users/${user._id}`)).send({
      bio: 'Hello world',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe('Hello world');
  });

  it('403s a user updating someone else\'s profile', async () => {
    const { token } = await registerUser();
    const { user: other } = await registerUser();

    const res = await authed(token)(request(app).put(`/api/users/${other._id}`)).send({ bio: 'Hack' });
    expect(res.status).toBe(403);
  });

  it('silently strips role/isActive changes from a non-admin self-update', async () => {
    const { token, user } = await registerUser();
    const res = await authed(token)(request(app).put(`/api/users/${user._id}`)).send({
      role: 'admin',
      isActive: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('member');
    expect(res.body.data.isActive).toBe(true);
  });

  it('lets an admin change another user\'s role', async () => {
    const { token: adminToken } = await registerAdmin();
    const { user: member } = await registerUser();

    const res = await authed(adminToken)(request(app).put(`/api/users/${member._id}`)).send({ role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('admin');
  });
});

describe('DELETE /api/users/:id', () => {
  it('403s for a non-admin', async () => {
    const { token } = await registerUser();
    const { user: other } = await registerUser();
    const res = await authed(token)(request(app).delete(`/api/users/${other._id}`));
    expect(res.status).toBe(403);
  });

  it('blocks an admin from deleting their own account', async () => {
    const { token, user } = await registerAdmin();
    const res = await authed(token)(request(app).delete(`/api/users/${user._id}`));
    expect(res.status).toBe(400);
  });

  it('lets an admin delete another user', async () => {
    const { token } = await registerAdmin();
    const { user: other } = await registerUser();

    const res = await authed(token)(request(app).delete(`/api/users/${other._id}`));
    expect(res.status).toBe(200);

    const followUp = await authed(token)(request(app).get(`/api/users/${other._id}`));
    expect(followUp.status).toBe(404);
  });
});

describe('PATCH /api/users/:id/toggle-status', () => {
  it('403s for a non-admin', async () => {
    const { token } = await registerUser();
    const { user: other } = await registerUser();
    const res = await authed(token)(request(app).patch(`/api/users/${other._id}/toggle-status`));
    expect(res.status).toBe(403);
  });

  it('toggles isActive for an admin', async () => {
    const { token } = await registerAdmin();
    const { user: other } = await registerUser();

    const res = await authed(token)(request(app).patch(`/api/users/${other._id}/toggle-status`));
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});
