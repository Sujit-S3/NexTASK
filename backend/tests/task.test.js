const request = require('supertest');
const app = require('../app');
const db = require('./db');
const { registerUser, registerAdmin } = require('./helpers');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

const authed = (token) => (req) => req.set('Authorization', `Bearer ${token}`);

describe('task CRUD', () => {
  it('403s task creation from a non-admin (route is admin-only)', async () => {
    const { token } = await registerUser();
    const res = await authed(token)(request(app).post('/api/tasks')).send({ title: 'Write tests' });
    expect(res.status).toBe(403);
  });

  it('allows an admin to create a task', async () => {
    const { token } = await registerAdmin();
    const res = await authed(token)(request(app).post('/api/tasks')).send({ title: 'Write tests' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Write tests');
    expect(res.body.data.status).toBe('todo');
  });

  it('rejects task creation with a title shorter than 3 characters', async () => {
    const { token } = await registerAdmin();
    const res = await authed(token)(request(app).post('/api/tasks')).send({ title: 'ab' });
    expect(res.status).toBe(400);
  });

  it('lets an admin create a task assigned to a member', async () => {
    const { token: adminToken } = await registerAdmin();
    const { user: member } = await registerUser();

    const res = await authed(adminToken)(request(app).post('/api/tasks')).send({
      title: 'Assigned task',
      assignedTo: member._id,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.assignedTo._id).toBe(member._id);
  });

  it('404s task creation when assignedTo does not reference a real user', async () => {
    const { token } = await registerAdmin();
    const res = await authed(token)(request(app).post('/api/tasks')).send({
      title: 'Ghost assignee',
      assignedTo: '64b7f9f9f9f9f9f9f9f9f9f9',
    });
    expect(res.status).toBe(404);
  });

  it('scopes GET /api/tasks to only the member\'s assigned tasks', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken, user: member } = await registerUser();

    await authed(adminToken)(request(app).post('/api/tasks')).send({ title: 'Not mine' });
    await authed(adminToken)(request(app).post('/api/tasks')).send({
      title: 'Mine',
      assignedTo: member._id,
    });

    const res = await authed(memberToken)(request(app).get('/api/tasks'));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Mine');
  });

  it('403s when a member fetches a task not assigned to them', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken } = await registerUser();

    const create = await authed(adminToken)(request(app).post('/api/tasks')).send({ title: 'Someone else\'s' });

    const res = await authed(memberToken)(request(app).get(`/api/tasks/${create.body.data._id}`));
    expect(res.status).toBe(403);
  });

  it('restricts a member to only updating status on their own task', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken, user: member } = await registerUser();

    const create = await authed(adminToken)(request(app).post('/api/tasks')).send({
      title: 'Member task',
      assignedTo: member._id,
    });
    const taskId = create.body.data._id;

    const statusUpdate = await authed(memberToken)(request(app).put(`/api/tasks/${taskId}`)).send({
      status: 'in-progress',
    });
    expect(statusUpdate.status).toBe(200);
    expect(statusUpdate.body.data.status).toBe('in-progress');

    const forbiddenUpdate = await authed(memberToken)(request(app).put(`/api/tasks/${taskId}`)).send({
      title: 'Renamed',
    });
    expect(forbiddenUpdate.status).toBe(403);
  });

  it('lets an admin update any field on a task', async () => {
    const { token: adminToken } = await registerAdmin();
    const create = await authed(adminToken)(request(app).post('/api/tasks')).send({ title: 'Original' });

    const res = await authed(adminToken)(request(app).put(`/api/tasks/${create.body.data._id}`)).send({
      title: 'Updated title',
      priority: 'critical',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated title');
    expect(res.body.data.priority).toBe('critical');
  });

  it('404s updating a task that does not exist', async () => {
    const { token } = await registerAdmin();
    const res = await authed(token)(request(app).put('/api/tasks/64b7f9f9f9f9f9f9f9f9f9f9')).send({
      status: 'in-progress',
    });
    expect(res.status).toBe(404);
  });

  it('rejects delete from a non-admin with 403', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken } = await registerUser();

    const create = await authed(adminToken)(request(app).post('/api/tasks')).send({ title: 'Protected' });
    const res = await authed(memberToken)(request(app).delete(`/api/tasks/${create.body.data._id}`));

    expect(res.status).toBe(403);
  });

  it('lets an admin delete a task', async () => {
    const { token } = await registerAdmin();
    const create = await authed(token)(request(app).post('/api/tasks')).send({ title: 'To delete' });

    const res = await authed(token)(request(app).delete(`/api/tasks/${create.body.data._id}`));
    expect(res.status).toBe(200);

    const followUp = await authed(token)(request(app).get(`/api/tasks/${create.body.data._id}`));
    expect(followUp.status).toBe(404);
  });

  it('403s assignTask when called by a non-admin', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken } = await registerUser();
    const { user: assignee } = await registerUser();

    const create = await authed(adminToken)(request(app).post('/api/tasks')).send({ title: 'Reassign me' });
    const res = await authed(memberToken)(request(app).patch(`/api/tasks/${create.body.data._id}/assign`)).send({
      userId: assignee._id,
    });

    expect(res.status).toBe(403);
  });

  it('lets an admin reassign a task via assignTask', async () => {
    const { token: adminToken } = await registerAdmin();
    const { user: assignee } = await registerUser();

    const create = await authed(adminToken)(request(app).post('/api/tasks')).send({ title: 'Reassign me' });
    const res = await authed(adminToken)(request(app).patch(`/api/tasks/${create.body.data._id}/assign`)).send({
      userId: assignee._id,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.assignedTo._id).toBe(assignee._id);
  });
});

describe('nested comment routes', () => {
  const createTaskAssignedTo = async (adminToken, memberId, title = 'Commented task') => {
    const res = await authed(adminToken)(request(app).post('/api/tasks')).send({ title, assignedTo: memberId });
    return res.body.data._id;
  };

  it('adds a comment and lists it back', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken, user: member } = await registerUser();
    const taskId = await createTaskAssignedTo(adminToken, member._id);

    const add = await authed(memberToken)(request(app).post(`/api/tasks/${taskId}/comments`)).send({
      content: 'Looks good',
    });
    expect(add.status).toBe(201);

    const list = await authed(memberToken)(request(app).get(`/api/tasks/${taskId}/comments`));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].content).toBe('Looks good');
  });

  it('403s a member commenting on a task not assigned to them', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: otherToken } = await registerUser();
    const { user: member } = await registerUser();
    const taskId = await createTaskAssignedTo(adminToken, member._id);

    const res = await authed(otherToken)(request(app).post(`/api/tasks/${taskId}/comments`)).send({
      content: 'Not allowed',
    });
    expect(res.status).toBe(403);
  });

  it('only lets the comment author or an admin edit it', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken, user: member } = await registerUser();
    const { token: otherToken } = await registerUser();
    const taskId = await createTaskAssignedTo(adminToken, member._id);

    const add = await authed(memberToken)(request(app).post(`/api/tasks/${taskId}/comments`)).send({
      content: 'Original',
    });
    const commentId = add.body.data._id;

    const forbidden = await authed(otherToken)(request(app).put(`/api/tasks/${taskId}/comments/${commentId}`)).send({
      content: 'Hijacked',
    });
    expect(forbidden.status).toBe(403);

    const allowed = await authed(memberToken)(request(app).put(`/api/tasks/${taskId}/comments/${commentId}`)).send({
      content: 'Edited',
    });
    expect(allowed.status).toBe(200);
    expect(allowed.body.data.content).toBe('Edited');

    const adminEdit = await authed(adminToken)(request(app).put(`/api/tasks/${taskId}/comments/${commentId}`)).send({
      content: 'Edited by admin',
    });
    expect(adminEdit.status).toBe(200);
  });

  it('deletes a comment as its author', async () => {
    const { token: adminToken } = await registerAdmin();
    const { token: memberToken, user: member } = await registerUser();
    const taskId = await createTaskAssignedTo(adminToken, member._id);

    const add = await authed(memberToken)(request(app).post(`/api/tasks/${taskId}/comments`)).send({
      content: 'Delete me',
    });

    const del = await authed(memberToken)(
      request(app).delete(`/api/tasks/${taskId}/comments/${add.body.data._id}`)
    );
    expect(del.status).toBe(200);

    const list = await authed(memberToken)(request(app).get(`/api/tasks/${taskId}/comments`));
    expect(list.body.data).toHaveLength(0);
  });
});
