/**
 * Complete Workflow Test Script
 * Tests: Event Creation → Approvals → Venue Allocation
 * 
 * Prerequisites:
 * 1. Backend server running on http://localhost:5000
 * 2. MongoDB running with college_events database
 * 3. Test users created with appropriate roles
 * 
 * Run: node test_workflow.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const CREDENTIALS = {
  eventTeam: { email: 'eventteam@college.edu', password: 'password123' },
  treasurer: { email: 'treasurer@college.edu', password: 'password123' },
  genSec: { email: 'gensec@college.edu', password: 'password123' },
  chairperson: { email: 'chairperson@college.edu', password: 'password123' },
  hospitality: { email: 'hospitality@college.edu', password: 'password123' }
};

let tokens = {};
let testEventId = null;

// Helper function to login
async function login(role, credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    tokens[role] = response.data.token;
    console.log(`✅ ${role} logged in successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${role} login failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

// Helper function to get auth header
function getAuthHeader(role) {
  return { headers: { Authorization: `Bearer ${tokens[role]}` } };
}

// Test 1: Event Team creates event
async function testCreateEvent() {
  console.log('\n📝 TEST 1: Creating Event...');
  
  const eventData = {
    title: 'Test Hackathon 2026',
    type: 'Hackathon',
    description: 'A test hackathon event for workflow testing',
    date: '2026-04-15',
    time: '09:00',
    duration_hours: 8,
    expected_participants: 100,
    prize_pool_required: true,
    prize_pool: 50000,
    registration_fee_required: true,
    tags: ['Programming & Coding', 'DSA & Problem Solving'],
    requirements: {
      volunteers_needed: 8,
      rooms_needed: 3,
      computer_labs_needed: true,
      computer_labs_count: 2,
      system_per_participant: true,
      internet_needed: true,
      judges_needed: true,
      judges_count: 3,
      refreshments_needed: true,
      refreshment_items: [],
      stationary_needed: true,
      stationary_items: [],
      technical_needed: true,
      technical_items: [],
      goodies_needed: true,
      physical_certificate: true,
      trophies_needed: true
    }
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/events`,
      eventData,
      getAuthHeader('eventTeam')
    );
    testEventId = response.data._id;
    console.log(`✅ Event created successfully (ID: ${testEventId})`);
    console.log(`   Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.error('❌ Event creation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: Check schedule conflicts
async function testScheduleConflict() {
  console.log('\n🔍 TEST 2: Checking Schedule Conflicts...');
  
  const conflictData = {
    date: '2026-04-15',
    time: '09:00',
    duration_hours: 8,
    type: 'Hackathon',
    expected_participants: 100,
    prize_pool: 50000,
    registration_fee: 0
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/scheduling/check-conflict`,
      conflictData,
      getAuthHeader('eventTeam')
    );
    console.log(`✅ Schedule check completed`);
    console.log(`   Has Conflicts: ${response.data.hasConflicts}`);
    if (response.data.hasConflicts) {
      console.log(`   Conflicts: ${response.data.conflicts.length}`);
      console.log(`   Suggestions: ${response.data.suggestions.length}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Schedule check failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 3: Submit event for approval
async function testSubmitEvent() {
  console.log('\n📤 TEST 3: Submitting Event for Approval...');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/events/${testEventId}/submit`,
      {},
      getAuthHeader('eventTeam')
    );
    console.log(`✅ Event submitted successfully`);
    console.log(`   Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.error('❌ Event submission failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 4: Treasurer approval
async function testTreasurerApproval() {
  console.log('\n💰 TEST 4: Treasurer Approval...');
  
  const approvalData = {
    action: 'approve',
    registration_fee: 500,
    comments: 'Budget approved. Registration fee set to ₹500.'
  };

  try {
    const response = await axios.put(
      `${BASE_URL}/treasurer/events/${testEventId}`,
      approvalData,
      getAuthHeader('treasurer')
    );
    console.log(`✅ Treasurer approved event`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Registration Fee: ₹${response.data.registration_fee}`);
    return true;
  } catch (error) {
    console.error('❌ Treasurer approval failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Gen Sec approval
async function testGenSecApproval() {
  console.log('\n👔 TEST 5: General Secretary Approval...');
  
  const approvalData = {
    action: 'approve',
    comments: 'Event plan looks good. Approved.'
  };

  try {
    const response = await axios.put(
      `${BASE_URL}/gensec/events/${testEventId}`,
      approvalData,
      getAuthHeader('genSec')
    );
    console.log(`✅ Gen Sec approved event`);
    console.log(`   Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.error('❌ Gen Sec approval failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: Chairperson approval
async function testChairpersonApproval() {
  console.log('\n🎓 TEST 6: Chairperson Approval...');
  
  const approvalData = {
    action: 'approve',
    comments: 'Final approval granted. Event can proceed.'
  };

  try {
    const response = await axios.put(
      `${BASE_URL}/chairperson/events/${testEventId}`,
      approvalData,
      getAuthHeader('chairperson')
    );
    console.log(`✅ Chairperson approved event`);
    console.log(`   Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.error('❌ Chairperson approval failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 7: Hospitality views requirements
async function testViewRequirements() {
  console.log('\n🏨 TEST 7: Hospitality Views Requirements...');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/hospitality/events`,
      getAuthHeader('hospitality')
    );
    const event = response.data.find(e => e._id === testEventId);
    if (event) {
      console.log(`✅ Event found in hospitality dashboard`);
      console.log(`   Expected Participants: ${event.expected_participants}`);
      console.log(`   Duration: ${event.duration_hours} hours`);
      console.log(`   Type: ${event.type}`);
      return true;
    } else {
      console.error('❌ Event not found in hospitality dashboard');
      return false;
    }
  } catch (error) {
    console.error('❌ View requirements failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 8: Acknowledge requirements
async function testAcknowledgeRequirements() {
  console.log('\n✔️ TEST 8: Acknowledging Requirements...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/hospitality/acknowledge/${testEventId}`,
      {},
      getAuthHeader('hospitality')
    );
    console.log(`✅ Requirements acknowledged`);
    return true;
  } catch (error) {
    console.error('❌ Acknowledge requirements failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 9: Auto-generate venue suggestion
async function testAutoGenerateVenue() {
  console.log('\n🤖 TEST 9: Auto-Generating Venue Suggestion...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/scheduling/generate`,
      { eventIds: [testEventId] },
      getAuthHeader('hospitality')
    );
    
    if (response.data.schedule && response.data.schedule.length > 0) {
      const suggestion = response.data.schedule[0];
      console.log(`✅ Venue suggestion generated`);
      console.log(`   Suggested Venue: ${suggestion.venueName || 'N/A'}`);
      console.log(`   Venue Type: ${suggestion.venueType || 'N/A'}`);
      console.log(`   Capacity: ${suggestion.venueCapacity || 'N/A'}`);
      console.log(`   Utilization: ${suggestion.utilization || 'N/A'}%`);
      console.log(`   Priority Score: ${suggestion.priority || 'N/A'}`);
      return true;
    } else {
      console.log('⚠️ No venue suggestion generated (may be expected if no suitable venue)');
      return true;
    }
  } catch (error) {
    console.error('❌ Auto-generate venue failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 10: Allocate venue
async function testAllocateVenue() {
  console.log('\n🏢 TEST 10: Allocating Venue...');
  
  const venueData = {
    allocated_rooms: [
      { room_number: '101', room_name: 'Computer Lab 1' },
      { room_number: '102', room_name: 'Computer Lab 2' },
      { room_number: '201', room_name: 'Conference Hall' }
    ],
    lab_allocated: 'Computer Lab 1, Computer Lab 2',
    venue_details: 'Room 101 (Computer Lab 1), Room 102 (Computer Lab 2), Room 201 (Conference Hall)'
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/hospitality/venue/${testEventId}`,
      venueData,
      getAuthHeader('hospitality')
    );
    console.log(`✅ Venue allocated successfully`);
    console.log(`   Allocated Rooms: ${venueData.allocated_rooms.length}`);
    console.log(`   Lab: ${venueData.lab_allocated}`);
    return true;
  } catch (error) {
    console.error('❌ Venue allocation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 11: Verify venue allocation in Event Team dashboard
async function testVerifyVenueAllocation() {
  console.log('\n🔍 TEST 11: Verifying Venue Allocation...');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/events`,
      getAuthHeader('eventTeam')
    );
    const event = response.data.find(e => e._id === testEventId);
    
    if (event && event.hospitality && event.hospitality.venue_allocated) {
      console.log(`✅ Venue allocation verified in Event Team dashboard`);
      console.log(`   Allocated Rooms: ${event.hospitality.allocated_rooms?.length || 0}`);
      console.log(`   Lab: ${event.hospitality.lab_allocated || 'N/A'}`);
      console.log(`   Venue Details: ${event.hospitality.venue_details || 'N/A'}`);
      return true;
    } else {
      console.error('❌ Venue allocation not found in event');
      return false;
    }
  } catch (error) {
    console.error('❌ Verify venue allocation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 12: Cleanup - Delete test event
async function testCleanup() {
  console.log('\n🧹 TEST 12: Cleaning Up Test Data...');
  
  try {
    await axios.delete(
      `${BASE_URL}/events/${testEventId}`,
      getAuthHeader('eventTeam')
    );
    console.log(`✅ Test event deleted successfully`);
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Complete Workflow Test\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = 12;
  
  // Login all users
  console.log('\n🔐 Logging in all users...');
  const loginResults = await Promise.all([
    login('eventTeam', CREDENTIALS.eventTeam),
    login('treasurer', CREDENTIALS.treasurer),
    login('genSec', CREDENTIALS.genSec),
    login('chairperson', CREDENTIALS.chairperson),
    login('hospitality', CREDENTIALS.hospitality)
  ]);
  
  if (!loginResults.every(r => r)) {
    console.error('\n❌ Login failed for one or more users. Aborting tests.');
    return;
  }
  
  // Run tests sequentially
  const tests = [
    testCreateEvent,
    testScheduleConflict,
    testSubmitEvent,
    testTreasurerApproval,
    testGenSecApproval,
    testChairpersonApproval,
    testViewRequirements,
    testAcknowledgeRequirements,
    testAutoGenerateVenue,
    testAllocateVenue,
    testVerifyVenueAllocation,
    testCleanup
  ];
  
  for (const test of tests) {
    const result = await test();
    if (result) passedTests++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ ALL TESTS PASSED! Workflow is working correctly.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Please check the logs above.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
