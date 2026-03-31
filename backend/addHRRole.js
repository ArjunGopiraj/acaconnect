const mongoose = require('mongoose');
const Role = require('./src/models/Role');

const addHRRole = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    // Check if HR role already exists
    const existingRole = await Role.findOne({ name: 'HR' });
    if (existingRole) {
      console.log('HR role already exists');
      return;
    }

    // Create HR role
    const hrRole = new Role({
      name: 'HR',
      description: 'Human Resources team responsible for volunteer and judge allocation'
    });

    await hrRole.save();
    console.log('HR role created successfully');

  } catch (error) {
    console.error('Error adding HR role:', error);
  } finally {
    mongoose.connection.close();
  }
};

addHRRole();