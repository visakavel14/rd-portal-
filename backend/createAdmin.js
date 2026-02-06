require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portal';

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      email: 'admin@rdportal.com',
      role: 'admin',
      department: 'R&D'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

createAdmin();
