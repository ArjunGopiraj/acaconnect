require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');

async function updateExistingEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events to update`);

    for (let event of events) {
      const updates = {};

      // Add missing venue if not present
      if (!event.venue) {
        updates.venue = 'TBD';
      }

      // Add missing registration_fee if not present
      if (event.registration_fee === undefined || event.registration_fee === null) {
        updates.registration_fee = 0;
      }

      // Ensure requirements object has all fields
      if (!event.requirements) {
        updates.requirements = {
          volunteers_needed: 0,
          rooms_needed: 0,
          refreshments_needed: false,
          stationary_needed: false,
          stationary_items: [],
          goodies_needed: false,
          physical_certificate: false,
          trophies_needed: false
        };
      } else {
        // Update individual requirement fields if missing
        if (event.requirements.volunteers_needed === undefined) {
          updates['requirements.volunteers_needed'] = 0;
        }
        if (event.requirements.rooms_needed === undefined) {
          updates['requirements.rooms_needed'] = 0;
        }
        if (event.requirements.refreshments_needed === undefined) {
          updates['requirements.refreshments_needed'] = false;
        }
        if (event.requirements.stationary_needed === undefined) {
          updates['requirements.stationary_needed'] = false;
        }
        if (!event.requirements.stationary_items) {
          updates['requirements.stationary_items'] = [];
        }
        if (event.requirements.goodies_needed === undefined) {
          updates['requirements.goodies_needed'] = false;
        }
        if (event.requirements.physical_certificate === undefined) {
          updates['requirements.physical_certificate'] = false;
        }
        if (event.requirements.trophies_needed === undefined) {
          updates['requirements.trophies_needed'] = false;
        }
      }

      // Add missing prize_distribution if not present
      if (!event.prize_distribution) {
        updates.prize_distribution = {
          first: 0,
          second: 0,
          third: 0
        };
      }

      // Add missing total_budget if not present
      if (event.total_budget === undefined || event.total_budget === null) {
        updates.total_budget = 0;
      }

      // Add missing prize_pool_required if not present
      if (event.prize_pool_required === undefined) {
        updates.prize_pool_required = false;
      }

      // Update the event if there are changes
      if (Object.keys(updates).length > 0) {
        await Event.findByIdAndUpdate(event._id, updates);
        console.log(`Updated event: ${event.title}`);
      }
    }

    console.log('All events updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating events:', error);
    process.exit(1);
  }
}

updateExistingEvents();