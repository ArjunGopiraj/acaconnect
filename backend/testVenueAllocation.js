require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');

const testVenueAllocation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a published event to test with
    const event = await Event.findOne({ status: 'PUBLISHED' });
    if (!event) {
      console.log('No published events found');
      return;
    }

    console.log('Testing venue allocation for event:', event.title);

    // Simulate venue allocation
    const venueData = {
      allocated_rooms: [
        { room_number: '101', room_name: 'Conference Hall A' },
        { room_number: '102', room_name: 'Conference Hall B' }
      ],
      lab_allocated: 'Computer Lab 1',
      venue_details: 'Room 101, Room 102, Computer Lab 1'
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      {
        'hospitality.allocated_rooms': venueData.allocated_rooms,
        'hospitality.lab_allocated': venueData.lab_allocated,
        'hospitality.venue_details': venueData.venue_details,
        'hospitality.venue_allocated': true,
        'hospitality.venue_allocated_at': new Date(),
        'venue': venueData.venue_details
      },
      { new: true }
    );

    console.log('Venue allocation successful!');
    console.log('Event ID:', updatedEvent._id);
    console.log('Allocated Rooms:', updatedEvent.hospitality.allocated_rooms);
    console.log('Lab Allocated:', updatedEvent.hospitality.lab_allocated);
    console.log('Venue Details:', updatedEvent.hospitality.venue_details);
    console.log('Main Venue Field Updated:', updatedEvent.venue);

  } catch (error) {
    console.error('Error testing venue allocation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testVenueAllocation();