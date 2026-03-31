const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Event = require('./src/models/Events');
require('dotenv').config();

async function cleanupRegistrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all events to check which are free
    const events = await Event.find({});
    const freeEventIds = events.filter(event => event.registration_fee === 0).map(event => event._id);
    
    console.log(`Found ${freeEventIds.length} free events`);

    // Find registrations with invalid dates or no payment for paid events
    const invalidRegistrations = await Registration.find({
      $or: [
        { payment_date: null },
        { payment_date: { $lt: new Date('2020-01-01') } }, // Before 2020
        { payment_id: null, event_id: { $nin: freeEventIds } }, // Paid events without payment ID
        { payment_id: '', event_id: { $nin: freeEventIds } }
      ]
    }).populate('event_id');

    console.log(`Found ${invalidRegistrations.length} invalid registrations`);

    for (const registration of invalidRegistrations) {
      const isFreeEvent = freeEventIds.some(id => id.equals(registration.event_id._id));
      
      if (isFreeEvent) {
        // Free event - keep but fix dates
        registration.payment_status = 'COMPLETED';
        registration.payment_method = 'FREE';
        registration.payment_date = registration.registration_date;
        registration.verification_status = 'APPROVED';
        registration.verification_date = registration.registration_date;
        await registration.save();
        console.log(`Fixed free event registration: ${registration.event_id?.title}`);
      } else if (!registration.payment_id || registration.payment_id === '') {
        // Paid event with no payment - remove
        await Registration.findByIdAndDelete(registration._id);
        console.log(`Removed unpaid registration: ${registration.event_id?.title}`);
      }
    }

    console.log('Cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanupRegistrations();