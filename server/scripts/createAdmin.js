const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB using the MONGO_URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      email: 'admin@microfinance.com',
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
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
    }

    // Check if member user already exists
    const existingMember = await User.findOne({
      email: 'member@microfinance.com',
    });

    if (existingMember) {
      console.log('Member user already exists');
    } else {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('member1234', saltRounds);

      // Create member user
      const memberUser = new User({
        name: 'Test Member',
        email: 'member@microfinance.com',
        phone: '+1234567891',
        password: hashedPassword,
        role: 'member',
        status: 'active',
        nationalID: 'MEMBER001',
        gender: 'other',
      });

      await memberUser.save();
      console.log('Member user created successfully');
      console.log('Email: member@microfinance.com');
      console.log('Password: member1234');
    }

    // Check if officer user already exists
    const existingOfficer = await User.findOne({
      email: 'officer@microfinance.com',
    });

    if (existingOfficer) {
      console.log('Officer user already exists');
    } else {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('officer1234', saltRounds);

      // Create officer user
      const officerUser = new User({
        name: 'Test Officer',
        email: 'officer@microfinance.com',
        phone: '+1234567892',
        password: hashedPassword,
        role: 'officer',
        status: 'active',
        nationalID: 'OFFICER001',
        gender: 'other',
      });

      await officerUser.save();
      console.log('Officer user created successfully');
      console.log('Email: officer@microfinance.com');
      console.log('Password: officer1234');
    }

    // Check if leader user already exists
    const existingLeader = await User.findOne({
      email: 'leader@microfinance.com',
    });

    if (existingLeader) {
      console.log('Leader user already exists');
    } else {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('leader1234', saltRounds);

      // Create leader user
      const leaderUser = new User({
        name: 'Test Leader',
        email: 'leader@microfinance.com',
        phone: '+1234567893',
        password: hashedPassword,
        role: 'leader',
        status: 'active',
        nationalID: 'LEADER001',
        gender: 'other',
      });

      await leaderUser.save();
      console.log('Leader user created successfully');
      console.log('Email: leader@microfinance.com');
      console.log('Password: leader1234');
    }

    console.log('Please change the passwords after first login!');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();
