const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-events')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Event = require('./src/models/Events');

async function updateChoreoNight() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    const result = await Event.updateOne(
      { title: 'Choreo Night' },
      { 
        date: today,
        time: currentTime
      }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✅ Choreo Night updated to ${today} at ${currentTime}`);
    } else {
      console.log('❌ Choreo Night event not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateChoreoNight();