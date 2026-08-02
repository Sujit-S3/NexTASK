require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('./models/User');

async function createOrFindAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin already exists:');
      console.log('Email:', admin.email);
      console.log('(Password left untouched — use the change-password flow if you need to reset it.)');
      return;
    }

    const password = process.env.ADMIN_SEED_PASSWORD || crypto.randomBytes(9).toString('base64url');
    const email = process.env.ADMIN_SEED_EMAIL || 'admin@nextask.com';

    await User.create({ name: 'Super Admin', email, password, role: 'admin' });

    console.log('New admin created:');
    console.log('Email:', email);
    if (!process.env.ADMIN_SEED_PASSWORD) {
      console.log('Generated password (shown once, save it now):', password);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

createOrFindAdmin();
