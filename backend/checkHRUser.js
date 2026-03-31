const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

const checkHRUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    // Find HR user
    const hrUser = await User.findOne({ email: 'hr@test.com' }).populate('role_id');
    if (hrUser) {
      console.log('HR User found:');
      console.log('Name:', hrUser.name);
      console.log('Email:', hrUser.email);
      console.log('Role:', hrUser.role_id?.name);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('hr123', hrUser.password_hash);
      console.log('Password valid:', isPasswordValid);
    } else {
      console.log('HR user not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkHRUser();