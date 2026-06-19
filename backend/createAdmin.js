require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createOrFindAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin found:');
      console.log('Email:', admin.email);
      // We can't know the password if it's hashed, so we reset it to something default just in case,
      // OR we just tell the user the email.
      // Let's reset the password so the user can login.
      admin.password = 'Admin123!';
      await admin.save();
      console.log('Password reset to: Admin123!');
    } else {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@nextask.com',
        password: 'Admin123!',
        role: 'admin'
      });
      console.log('New Admin created:');
      console.log('Email: admin@nextask.com');
      console.log('Password: Admin123!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

createOrFindAdmin();
