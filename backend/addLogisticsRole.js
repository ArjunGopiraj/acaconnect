require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./src/models/Role');

const addLogisticsRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if LOGISTICS role already exists
    const existingRole = await Role.findOne({ name: 'LOGISTICS' });
    if (existingRole) {
      console.log('LOGISTICS role already exists');
      return;
    }

    // Create LOGISTICS role
    const logisticsRole = new Role({ name: 'LOGISTICS' });
    await logisticsRole.save();
    console.log('LOGISTICS role created successfully');

  } catch (error) {
    console.error('Error adding LOGISTICS role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addLogisticsRole();