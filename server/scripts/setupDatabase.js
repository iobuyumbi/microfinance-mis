const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function setupDatabase() {
  try {
    // Check if admin user exists
    const existingAdmin = await User.findOne({
      email: 'admin@microfinance.com',
    });

    if (!existingAdmin) {
      console.log('Creating default admin user...');

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
      console.log('✅ Default admin user created successfully');
      console.log('📧 Email: admin@microfinance.com');
      console.log('🔑 Password: admin1234');
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

module.exports = setupDatabase;
