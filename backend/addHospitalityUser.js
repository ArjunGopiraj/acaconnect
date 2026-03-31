require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

const addHospitalityUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find HOSPITALITY role
    const hospitalityRole = await Role.findOne({ name: 'HOSPITALITY' });
    if (!hospitalityRole) {
      console.log('HOSPITALITY role not found');
      return;
    }

    // Check if hospitality user already exists
    const existingUser = await User.findOne({ email: 'hospitality@test.com' });
    if (existingUser) {
      console.log('Hospitality user already exists');
      console.log('Email: hospitality@test.com');
      console.log('Password: hospitality123');
      return;
    }

    // Create hospitality user
    const hashedPassword = await bcrypt.hash('hospitality123', 10);
    const hospitalityUser = new User({
      name: 'Hospitality Team',
      email: 'hospitality@test.com',
      password_hash: hashedPassword,
      role_id: hospitalityRole._id
    });

    await hospitalityUser.save();
    console.log('Hospitality user created successfully!');
    console.log('Email: hospitality@test.com');
    console.log('Password: hospitality123');

  } catch (error) {
    console.error('Error adding hospitality user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addHospitalityUser();