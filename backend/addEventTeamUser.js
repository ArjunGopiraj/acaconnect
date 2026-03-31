const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/college_events');

async function addEventTeamUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const eventTeamUser = new User({
      name: 'Event Team Admin',
      email: 'eventteam@niral.com',
      password: hashedPassword,
      role: 'EVENT_TEAM',
      isVerified: true
    });

    await eventTeamUser.save();
    console.log('EVENT_TEAM user created successfully');
    
  } catch (error) {
    console.error('Error creating EVENT_TEAM user:', error);
  } finally {
    mongoose.connection.close();
  }
}

addEventTeamUser();