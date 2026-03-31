const mongoose = require('mongoose');
require('dotenv').config();

const ParticipantNotificationService = require('./src/services/participantNotification.service');
const Participant = require('./src/models/Participant');

async function testNotificationSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find a test participant
    const participant = await Participant.findOne({ isVerified: true });
    if (!participant) {
      console.log('No verified participants found. Please register a participant first.');
      return;
    }

    console.log(`Testing notifications for participant: ${participant.name} (${participant.email})`);

    // Test 1: Send a simple notification
    console.log('\n=== Test 1: Simple Notification ===');
    const notification1 = await ParticipantNotificationService.notifyParticipant(
      participant._id,
      'Welcome to NIRAL 2026! This is a test notification.',
      null,
      'announcement'
    );
    console.log('✅ Simple notification sent:', notification1._id);

    // Test 2: Send attendance notification
    console.log('\n=== Test 2: Attendance Notification ===');
    const notification2 = await ParticipantNotificationService.notifyAttendanceMarked(
      participant._id,
      'Test Event',
      'PRESENT',
      null
    );
    console.log('✅ Attendance notification sent:', notification2._id);

    // Test 3: Send event update notification
    console.log('\n=== Test 3: Event Update Notification ===');
    const notification3 = await ParticipantNotificationService.notifyParticipant(
      participant._id,
      'Event "Test Event" has been updated. Please check the latest details.',
      null,
      'event_update'
    );
    console.log('✅ Event update notification sent:', notification3._id);

    console.log('\n🎉 All notification tests passed!');
    console.log('\nYou can now:');
    console.log('1. Login as the participant in the frontend');
    console.log('2. Click the notification bell icon');
    console.log('3. See the test notifications');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testNotificationSystem();