const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/microfinance-mis'
    );
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      email: 'admin@microfinance.com',
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin1234', saltRounds);

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@microfinance.com',
      phone: '+1234567890',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      nationalID: 'ADMIN001',
      gender: 'other',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@microfinance.com');
    console.log('Password: admin1234');
    console.log('Please change the password after first login!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();
