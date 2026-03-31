require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./src/models/Role');

const addHospitalityRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if HOSPITALITY role already exists
    const existingRole = await Role.findOne({ name: 'HOSPITALITY' });
    if (existingRole) {
      console.log('HOSPITALITY role already exists');
      return;
    }

    // Create HOSPITALITY role
    const hospitalityRole = new Role({
      name: 'HOSPITALITY',
      description: 'Hospitality team responsible for venue allocation and room management'
    });

    await hospitalityRole.save();
    console.log('HOSPITALITY role created successfully!');

  } catch (error) {
    console.error('Error adding HOSPITALITY role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addHospitalityRole();