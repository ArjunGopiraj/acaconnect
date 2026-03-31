require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

const addLogisticsUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find LOGISTICS role
    const logisticsRole = await Role.findOne({ name: 'LOGISTICS' });
    if (!logisticsRole) {
      console.log('LOGISTICS role not found');
      return;
    }

    // Check if logistics user already exists
    const existingUser = await User.findOne({ email: 'logistics@test.com' });
    if (existingUser) {
      console.log('Logistics user already exists');
      console.log('Email: logistics@test.com');
      console.log('Password: logistics123');
      return;
    }

    // Create logistics user
    const hashedPassword = await bcrypt.hash('logistics123', 10);
    const logisticsUser = new User({
      name: 'Logistics Team',
      email: 'logistics@test.com',
      password_hash: hashedPassword,
      role_id: logisticsRole._id
    });

    await logisticsUser.save();
    console.log('Logistics user created successfully!');
    console.log('Email: logistics@test.com');
    console.log('Password: logistics123');

  } catch (error) {
    console.error('Error adding logistics user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addLogisticsUser();