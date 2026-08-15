const User = require('./models/User');

async function ensureAdminUser() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('✅ Admin user ready:', admin.email);
      return admin;
    }

    const email = process.env.ADMIN_SEED_EMAIL || 'admin@nextask.com';
    const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';

    const newAdmin = await User.create({ name: 'Super Admin', email, password, role: 'admin' });
    console.log('🔑 Seeded default admin user:', email);
    return newAdmin;
  } catch (err) {
    console.error('Error ensuring seed admin user:', err.message);
  }
}

module.exports = { ensureAdminUser };

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await ensureAdminUser();
    await mongoose.disconnect();
  });
}
