const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

const addHRUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    // Check if HR user already exists
    const existingUser = await User.findOne({ email: 'hr@test.com' });
    if (existingUser) {
      console.log('HR user already exists');
      return;
    }

    // Get HR role
    const hrRole = await Role.findOne({ name: 'HR' });
    if (!hrRole) {
      console.log('HR role not found. Please run addHRRole.js first.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('hr123', 10);

    // Create HR user
    const hrUser = new User({
      name: 'HR Team',
      email: 'hr@test.com',
      password_hash: hashedPassword,
      role_id: hrRole._id
    });

    await hrUser.save();
    console.log('HR user created successfully');
    console.log('Login credentials: hr@test.com / hr123');

  } catch (error) {
    console.error('Error adding HR user:', error);
  } finally {
    mongoose.connection.close();
  }
};

addHRUser();