const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Event = require('./src/models/Events');
const Participant = require('./src/models/Participant');

mongoose.connect('mongodb://localhost:27017/college_events');

async function addTestRegistrations() {
  try {
    // Get first published event
    const event = await Event.findOne({ status: 'PUBLISHED' });
    
    if (!event) {
      console.log('No published events found');
      return;
    }

    console.log(`Adding test registrations for event: ${event.title}`);

    // Create test participants first
    const testParticipants = [
      {
        name: 'Arjun Sharma',
        email: 'arjun.sharma@example.com',
        mobile: '9876543210',
        password_hash: 'test_password_hash',
        college: 'ABC College',
        department: 'Computer Science',
        year: '3rd Year',
        isVerified: true
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        mobile: '9876543211',
        password_hash: 'test_password_hash',
        college: 'XYZ University',
        department: 'Information Technology',
        year: '2nd Year',
        isVerified: true
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@example.com',
        mobile: '9876543212',
        password_hash: 'test_password_hash',
        college: 'PQR Institute',
        department: 'Electronics',
        year: '4th Year',
        isVerified: true
      }
    ];

    const createdParticipants = await Participant.insertMany(testParticipants);
    console.log('Test participants created');

    // Create registrations
    const testRegistrations = createdParticipants.map(participant => ({
      event_id: event._id,
      participant_id: participant._id,
      participant_name: participant.name,
      participant_email: participant.email,
      registration_fee: event.registration_fee || 0,
      payment_status: 'COMPLETED',
      payment_method: 'MOCK_PAYMENT',
      payment_id: `test_payment_${participant._id}`,
      payment_date: new Date(),
      verification_status: 'APPROVED',
      registration_date: new Date()
    }));

    await Registration.insertMany(testRegistrations);
    console.log('Test registrations added successfully!');
    
  } catch (error) {
    console.error('Error adding test registrations:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestRegistrations();