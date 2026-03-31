const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college_events');

async function addTechopsUser() {
  try {
    // Find TECHOPS role
    const techopsRole = await Role.findOne({ name: 'TECHOPS' });
    if (!techopsRole) {
      console.log('TECHOPS role not found. Please run addTechopsRole.js first');
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'techops@test.com' });
    if (existingUser) {
      console.log('TECHOPS user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('techops123', 10);

    // Create TECHOPS user
    const techopsUser = new User({
      name: 'Techops Team',
      email: 'techops@test.com',
      password_hash: hashedPassword,
      role_id: techopsRole._id,
      department: 'Technical Operations',
      mobile: '9876543210'
    });

    await techopsUser.save();
    console.log('TECHOPS user created successfully');
    console.log('Login credentials:');
    console.log('Email: techops@test.com');
    console.log('Password: techops123');
    
  } catch (error) {
    console.error('Error creating TECHOPS user:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTechopsUser();