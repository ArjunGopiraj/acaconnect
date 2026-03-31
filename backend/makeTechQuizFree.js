const mongoose = require('mongoose');
const Event = require('./src/models/Events');

mongoose.connect('mongodb://localhost:27017/college_events');

async function makeTechQuizFree() {
  try {
    const result = await Event.updateOne(
      { title: 'Tech Quiz Challenge' },
      { 
        registration_fee: 0,
        registration_fee_required: false
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Tech Quiz Challenge event updated to FREE registration');
    } else {
      console.log('Tech Quiz Challenge event not found or already free');
    }
    
  } catch (error) {
    console.error('Error updating event:', error);
  } finally {
    mongoose.connection.close();
  }
}

makeTechQuizFree();