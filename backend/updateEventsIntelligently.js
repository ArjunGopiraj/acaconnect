require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');

async function updateEventsIntelligently() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const events = await Event.find({});
    console.log(`Found ${events.length} events to update`);

    for (let event of events) {
      const updates = {};
      
      // Determine venue based on event type and characteristics
      if (!event.venue || event.venue === 'TBD') {
        if (event.type === 'Technical') {
          if (event.title.toLowerCase().includes('hackathon')) {
            updates.venue = 'Computer Lab 1 & 2';
          } else if (event.tags?.includes('UI/UX Design')) {
            updates.venue = 'Design Studio';
          } else if (event.tags?.includes('Database & SQL')) {
            updates.venue = 'Computer Lab 3';
          } else if (event.tags?.includes('Programming & Coding')) {
            updates.venue = 'Computer Lab 1';
          } else {
            updates.venue = 'Seminar Hall A';
          }
        } else if (event.type === 'Non-Technical') {
          if (event.title.toLowerCase().includes('quiz')) {
            updates.venue = 'Auditorium';
          } else if (event.title.toLowerCase().includes('photography')) {
            updates.venue = 'Campus Grounds';
          } else if (event.title.toLowerCase().includes('treasure')) {
            updates.venue = 'Entire Campus';
          } else {
            updates.venue = 'Main Hall';
          }
        } else if (event.type === 'Seminar' || event.type === 'Workshop') {
          updates.venue = 'Conference Room';
        } else {
          updates.venue = 'Seminar Hall B';
        }
      }

      // Set registration fee based on event characteristics
      if (event.registration_fee === undefined || event.registration_fee === null) {
        if (event.prize_pool > 20000) {
          updates.registration_fee = 150;
        } else if (event.prize_pool > 10000) {
          updates.registration_fee = 100;
        } else if (event.prize_pool > 0) {
          updates.registration_fee = 50;
        } else {
          updates.registration_fee = 0;
        }
      }

      // Set requirements based on event type and size
      const requirementsUpdate = {};
      
      // Volunteers needed
      if (event.expected_participants > 100) {
        requirementsUpdate.volunteers_needed = 8;
      } else if (event.expected_participants > 50) {
        requirementsUpdate.volunteers_needed = 5;
      } else {
        requirementsUpdate.volunteers_needed = 3;
      }

      // Rooms needed
      if (event.expected_participants > 100) {
        requirementsUpdate.rooms_needed = 2;
      } else {
        requirementsUpdate.rooms_needed = 1;
      }

      // Refreshments based on duration and participants
      requirementsUpdate.refreshments_needed = event.duration_hours >= 3 || event.expected_participants > 50;

      // Stationery for technical events
      requirementsUpdate.stationary_needed = event.type === 'Technical' || event.type === 'Workshop';

      // Goodies for events with registration fee
      requirementsUpdate.goodies_needed = (event.registration_fee || 0) > 0;

      // Physical certificates for major events
      requirementsUpdate.physical_certificate = event.prize_pool > 10000;

      // Trophies for competitive events
      requirementsUpdate.trophies_needed = event.prize_pool > 0;

      // Stationery items for technical events
      if (requirementsUpdate.stationary_needed) {
        requirementsUpdate.stationary_items = [];
        // Add based on event type
        if (event.tags?.includes('Programming & Coding')) {
          requirementsUpdate.stationary_items.push({
            item_name: 'A4 Sheets',
            quantity: 100
          });
        }
        if (event.tags?.includes('UI/UX Design')) {
          requirementsUpdate.stationary_items.push({
            item_name: 'Sketch Pads',
            quantity: 50
          });
        }
      }

      updates.requirements = requirementsUpdate;

      // Set prize distribution if prize pool exists
      if (event.prize_pool > 0 && !event.prize_distribution?.first) {
        const total = event.prize_pool;
        updates.prize_distribution = {
          first: Math.floor(total * 0.5),
          second: Math.floor(total * 0.3),
          third: Math.floor(total * 0.2)
        };
      }

      // Set total budget based on various factors
      if (!event.total_budget || event.total_budget === 0) {
        let budget = event.prize_pool || 0;
        
        // Add refreshment costs
        if (requirementsUpdate.refreshments_needed) {
          budget += event.expected_participants * 50;
        }
        
        // Add stationery costs
        if (requirementsUpdate.stationary_needed) {
          budget += 2000;
        }
        
        // Add goodies costs
        if (requirementsUpdate.goodies_needed) {
          budget += event.expected_participants * 100;
        }
        
        // Add certificate costs
        if (requirementsUpdate.physical_certificate) {
          budget += 5000;
        }
        
        updates.total_budget = budget;
      }

      // Set prize_pool_required
      updates.prize_pool_required = (event.prize_pool || 0) > 0;

      // Update the event
      if (Object.keys(updates).length > 0) {
        await Event.findByIdAndUpdate(event._id, updates);
        console.log(`Updated ${event.title}:`);
        console.log(`  - Venue: ${updates.venue || 'unchanged'}`);
        console.log(`  - Registration Fee: ₹${updates.registration_fee || 'unchanged'}`);
        console.log(`  - Total Budget: ₹${updates.total_budget || 'unchanged'}`);
        console.log(`  - Volunteers: ${updates.requirements?.volunteers_needed || 'unchanged'}`);
        console.log('---');
      }
    }

    console.log('All events updated intelligently!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating events:', error);
    process.exit(1);
  }
}

updateEventsIntelligently();