const request = require('supertest');
const app = require('../app');
const db = require('./db');
const { registerUser, registerAdmin } = require('./helpers');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

describe('error handling', () => {
  it('returns a 400 CastError shape for an invalid ObjectId', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/tasks/not-a-valid-object-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not a valid ID/);
  });

  it('returns a 404 for an unknown route', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Route not found/);
  });

  it('returns a structured validation error shape', async () => {
    const { token } = await registerAdmin();
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors[0]).toHaveProperty('field');
    expect(res.body.errors[0]).toHaveProperty('message');
  });

  it('health check responds without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('does not 500 on page=0 and does not return unbounded results for limit=0', async () => {
    const { token } = await registerAdmin();

    const zeroPage = await request(app)
      .get('/api/tasks?page=0')
      .set('Authorization', `Bearer ${token}`);
    expect(zeroPage.status).toBe(200);
    expect(zeroPage.body.pagination.page).toBe(1);

    const zeroLimit = await request(app)
      .get('/api/tasks?limit=0')
      .set('Authorization', `Bearer ${token}`);
    expect(zeroLimit.status).toBe(200);
    expect(zeroLimit.body.pagination.limit).toBeGreaterThan(0);
    expect(Number.isFinite(zeroLimit.body.pagination.pages)).toBe(true);
  });
});
