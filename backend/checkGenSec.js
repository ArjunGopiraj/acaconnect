const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

const checkGenSec = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/college_events');
    console.log('Connected to MongoDB');

    const genSecRole = await Role.findOne({ name: 'GENERAL_SECRETARY' });
    console.log('General Secretary role:', genSecRole);

    if (genSecRole) {
      const genSecUsers = await User.find({ role_id: genSecRole._id });
      console.log(`Found ${genSecUsers.length} General Secretary users:`);
      genSecUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkGenSec();