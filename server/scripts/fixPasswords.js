const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/microfinance'
    );
    console.log('Connected to MongoDB');

    // Define the test users and their correct passwords
    const testUsers = [
      {
        email: 'admin@microfinance.com',
        password: 'admin1234',
        name: 'System Administrator',
      },
      {
        email: 'member@microfinance.com',
        password: 'member1234',
        name: 'Test Member',
      },
      {
        email: 'officer@microfinance.com',
        password: 'officer1234',
        name: 'Test Officer',
      },
      {
        email: 'leader@microfinance.com',
        password: 'leader1234',
        name: 'Test Leader',
      },
    ];

    for (const userData of testUsers) {
      const user = await User.findOne({ email: userData.email });

      if (user) {
        console.log(`Fixing password for ${userData.email}...`);

        // Set the plain password - it will be properly hashed by the pre-save middleware
        user.password = userData.password;
        await user.save();

        console.log(`✅ Password fixed for ${userData.email}`);
      } else {
        console.log(`❌ User not found: ${userData.email}`);
      }
    }

    console.log('\n🎉 All passwords have been fixed!');
    console.log('You can now login with these credentials:');
    console.log('Admin: admin@microfinance.com / admin1234');
    console.log('Member: member@microfinance.com / member1234');
    console.log('Officer: officer@microfinance.com / officer1234');
    console.log('Leader: leader@microfinance.com / leader1234');
  } catch (error) {
    console.error('Error fixing passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixPasswords();
