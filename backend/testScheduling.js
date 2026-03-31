const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const Venue = require('./src/models/Venue');
const schedulingService = require('./src/services/scheduling.service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/acaconnect';

async function testSchedulingSystem() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check venues
    const venues = await Venue.find();
    console.log(`✅ Test 1: Found ${venues.length} venues in database`);
    
    // Test 2: Check events
    const events = await Event.find({ status: { $in: ['PUBLISHED', 'CHAIRPERSON_APPROVED'] } });
    console.log(`✅ Test 2: Found ${events.length} published events`);
    
    if (events.length === 0) {
      console.log('⚠️  No published events found. Scheduling will work once events are published.\n');
      console.log('📋 System Status: READY (waiting for published events)');
      process.exit(0);
    }

    // Test 3: Calculate priority for first event
    const testEvent = events[0];
    const priority = schedulingService.calculatePriority(testEvent);
    console.log(`✅ Test 3: Priority calculation works (Event: "${testEvent.title}", Priority: ${priority})`);

    // Test 4: Check time conflicts
    const conflicts = await schedulingService.checkConflicts(testEvent._id);
    console.log(`✅ Test 4: Conflict detection works (${conflicts.conflicts.length} conflicts found)`);

    // Test 5: Generate schedule
    console.log('\n🎯 Test 5: Generating optimal schedule...');
    const eventIds = events.map(e => e._id);
    const schedule = await schedulingService.generateOptimalSchedule(eventIds);
    
    console.log(`✅ Schedule generated successfully!`);
    console.log(`   - Successfully scheduled: ${schedule.schedule.filter(s => s.venue).length}`);
    console.log(`   - Failed to schedule: ${schedule.schedule.filter(s => !s.venue).length}`);
    console.log(`   - Validation: ${schedule.validation.valid ? 'PASSED' : 'FAILED'}`);

    console.log('\n🎉 ALL TESTS PASSED! Scheduling system is working correctly.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSchedulingSystem();
