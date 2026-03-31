const mongoose = require('mongoose');
const Role = require('./src/models/Role');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college_events');

async function addTechopsRole() {
  try {
    // Check if TECHOPS role already exists
    const existingRole = await Role.findOne({ name: 'TECHOPS' });
    
    if (existingRole) {
      console.log('TECHOPS role already exists');
      return;
    }

    // Create TECHOPS role
    const techopsRole = new Role({
      name: 'TECHOPS',
      description: 'Technical Operations team responsible for attendance management and technical support during events'
    });

    await techopsRole.save();
    console.log('TECHOPS role added successfully');
    
    // Display all roles
    const allRoles = await Role.find({});
    console.log('All roles in database:');
    allRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });
    
  } catch (error) {
    console.error('Error adding TECHOPS role:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTechopsRole();