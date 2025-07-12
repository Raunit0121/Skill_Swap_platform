const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model from the backend
const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill_swap';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@skillswap.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Email: admin@skillswap.com');
      console.log('Password: password');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@skillswap.com',
      password: hashedPassword,
      role: 'admin',
      isPublic: false,
      skillsOffered: ['Administration', 'Management'],
      skillsWanted: [],
      availability: ['weekdays', 'weekends'],
      location: 'Admin Location',
      bio: 'Platform Administrator'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@skillswap.com');
    console.log('🔑 Password: password');
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();

// Check the user in MongoDB database
db.users.find({ email: "admin@skillswap.com" }).pretty()