const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

let counter = 0;
const uniqueEmail = (prefix) => `${prefix}_${Date.now()}_${counter++}@example.com`;

const registerUser = async ({ name = 'Test User', password = 'Password123' } = {}) => {
  const email = uniqueEmail('member');
  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  return { token: res.body.accessToken, user: res.body.user, email, password };
};

// Public registration always creates a 'member' (see authController.register); promote directly
// in the DB. The access token stays valid — `protect` resolves role live from the DB, not the JWT.
const registerAdmin = async (overrides = {}) => {
  const result = await registerUser({ ...overrides, name: overrides.name || 'Admin User' });
  await User.findByIdAndUpdate(result.user._id, { role: 'admin' });
  result.user.role = 'admin';
  return result;
};

module.exports = { registerUser, registerAdmin, uniqueEmail };
