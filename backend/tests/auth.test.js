const request = require('supertest');
const app = require('../app');
const db = require('./db');
const { registerUser, uniqueEmail } = require('./helpers');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

describe('POST /api/auth/register', () => {
  it('registers a new user and returns tokens', async () => {
    const email = uniqueEmail('register');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', email, password: 'Password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.role).toBe('member');
  });

  it('rejects duplicate email with 409', async () => {
    const email = uniqueEmail('dup');
    await request(app).post('/api/auth/register').send({ name: 'Ann', email, password: 'Password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email, password: 'Password123' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid payload with 400 validation errors', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const { email, password } = await registerUser();
    const res = await request(app).post('/api/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('rejects wrong password with 401', async () => {
    const { email } = await registerUser();
    const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail('missing'), password: 'Password123' });

    expect(res.status).toBe(401);
  });
});

describe('protected routes', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects requests with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('GET /me returns the current user', async () => {
    const { token, email } = await registerUser();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it('POST /logout succeeds for an authenticated user', async () => {
    const { token } = await registerUser();
    const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PATCH /api/auth/change-password', () => {
  it('updates the password when current password is correct', async () => {
    const { token, password } = await registerUser();
    const res = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: 'NewPassword123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects an incorrect current password with 401', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongCurrent1', newPassword: 'NewPassword123' });

    expect(res.status).toBe(401);
  });
});
