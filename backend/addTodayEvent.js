const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const Registration = require('./src/models/Registration');
const Participant = require('./src/models/Participant');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/college_events');

async function addTodayEvent() {
  try {
    // Get any user to create the event
    const anyUser = await User.findOne();
    
    if (!anyUser) {
      console.log('No users found');
      return;
    }

    // Create today's event
    const today = new Date();
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 1); // Set time to 1 hour from now
    
    const newEvent = new Event({
      title: 'Tech Quiz Challenge',
      description: 'Test your technical knowledge in this exciting quiz competition covering programming, databases, and emerging technologies.',
      type: 'Technical',
      date: today,
      time: currentTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration_hours: 2,
      venue: 'Computer Lab 1',
      expected_participants: 50,
      prize_pool: 5000,
      registration_fee: 100,
      registration_fee_required: true,
      status: 'PUBLISHED',
      created_by: anyUser._id,
      logistics: {
        expenses_allocated: true,
        allocated_expenses: [
          {
            expense_type: 'Refreshments',
            expense_amount: 2000,
            expense_description: 'Snacks and drinks for participants'
          }
        ]
      },
      hospitality: {
        venue_allocated: true,
        venue_details: 'Computer Lab 1 - Main Building'
      },
      hr: {
        volunteers_allocated: true,
        allocated_volunteers: [
          {
            volunteer_name: 'Suresh Kumar',
            volunteer_role: 'Quiz Master',
            volunteer_contact: '9876543220',
            volunteer_department: 'Computer Science'
          }
        ]
      }
    });

    const savedEvent = await newEvent.save();
    console.log(`Created today's event: ${savedEvent.title}`);

    // Get existing test participant
    const existingParticipant = await Participant.findOne({ name: 'Arjun Sharma' });
    
    // Create additional test participants for today's event
    const newParticipants = [
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        mobile: '9876543213',
        password_hash: 'test_password_hash',
        college: 'Tech Institute',
        department: 'Computer Science',
        year: '3rd Year',
        isVerified: true
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        mobile: '9876543214',
        password_hash: 'test_password_hash',
        college: 'Engineering College',
        department: 'Information Technology',
        year: '4th Year',
        isVerified: true
      }
    ];

    const createdParticipants = await Participant.insertMany(newParticipants);
    console.log('Created new test participants');

    // Create registrations for today's event
    const allParticipants = [existingParticipant, ...createdParticipants];
    
    const registrations = allParticipants.map(participant => ({
      event_id: savedEvent._id,
      participant_id: participant._id,
      participant_name: participant.name,
      participant_email: participant.email,
      registration_fee: savedEvent.registration_fee,
      payment_status: 'COMPLETED',
      payment_method: 'MOCK_PAYMENT',
      payment_id: `test_payment_${participant._id}`,
      payment_date: new Date(),
      verification_status: 'APPROVED',
      registration_date: new Date()
    }));

    await Registration.insertMany(registrations);
    console.log(`Created ${registrations.length} registrations for today's event`);
    console.log('Participants registered:');
    allParticipants.forEach(p => console.log(`- ${p.name} (${p.email})`));
    
  } catch (error) {
    console.error('Error creating today\'s event:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTodayEvent();