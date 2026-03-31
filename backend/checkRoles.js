const mongoose = require('mongoose');
const Role = require('./src/models/Role');

const checkRoles = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    const roles = await Role.find({});
    console.log('Available roles:');
    roles.forEach(role => {
      console.log(`- ${role.name} (ID: ${role._id})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkRoles();