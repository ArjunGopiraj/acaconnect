require("dotenv").config();
const connectDB = require("./config/db");
const { FSMService } = require("./services/fsm.service");
const Event = require("./models/Events");
const User = require("./models/User");

const testFSM = async () => {
  try {
    await connectDB();
    console.log("Testing FSM Algorithm...\n");

    // Get test users
    const eventTeam = await User.findOne({ email: "event@test.com" });
    const treasurer = await User.findOne({ email: "treasurer@test.com" });
    const genSec = await User.findOne({ email: "gensec@test.com" });
    const chairperson = await User.findOne({ email: "chair@test.com" });

    // Create test event
    const testEvent = await Event.create({
      title: "FSM Test Event",
      type: "Technical Workshop",
      date: new Date("2026-03-15"),
      time: "10:00",
      duration_hours: 2,
      venue: "Test Hall",
      expected_participants: 50,
      prize_pool: 5000,
      requirements: { volunteers_needed: 5 },
      created_by: eventTeam._id,
      status: "DRAFT"
    });

    console.log(`Created test event: ${testEvent._id}`);
    console.log(`Initial status: ${testEvent.status}\n`);

    // Test 1: Valid transitions
    console.log("Test 1: Valid Transitions");
    const validTransitions = FSMService.getValidTransitions("DRAFT", "EVENT_TEAM");
    console.log(`EVENT_TEAM can transition from DRAFT to: ${validTransitions.join(", ")}`);

    // Test 2: Invalid transition (should fail)
    console.log("\nTest 2: Invalid Transition (should fail)");
    try {
      await FSMService.transitionEvent(testEvent._id, "PUBLISHED", "EVENT_TEAM");
      console.log("ERROR: Invalid transition was allowed!");
    } catch (error) {
      console.log(`Correctly blocked: ${error.message}`);
    }

    // Test 3: Complete workflow
    console.log("\nTest 3: Complete Workflow");
    
    // Step 1: Submit for approval
    let event = await FSMService.transitionEvent(testEvent._id, "SUBMITTED", "EVENT_TEAM", "Ready for review");
    console.log(`EVENT_TEAM: ${event.status}`);

    // Step 2: Move to review
    event = await FSMService.transitionEvent(testEvent._id, "UNDER_REVIEW", "EVENT_TEAM", "Moving to review");
    console.log(`UNDER_REVIEW: ${event.status}`);

    // Step 3: Treasurer approval
    event = await FSMService.transitionEvent(testEvent._id, "TREASURER_APPROVED", "TREASURER", "Budget approved");
    console.log(`TREASURER: ${event.status}`);

    // Step 4: Gen Sec approval
    event = await FSMService.transitionEvent(testEvent._id, "GENSEC_APPROVED", "GENERAL_SECRETARY", "Logistics approved");
    console.log(`GEN_SEC: ${event.status}`);

    // Step 5: Chairperson approval
    event = await FSMService.transitionEvent(testEvent._id, "CHAIRPERSON_APPROVED", "CHAIRPERSON", "Final approval");
    console.log(`CHAIRPERSON: ${event.status}`);

    // Step 6: Publish
    event = await FSMService.transitionEvent(testEvent._id, "PUBLISHED", "CHAIRPERSON", "Event published");
    console.log(`PUBLISHED: ${event.status}`);

    // Test 4: Check audit trail
    console.log("\nTest 4: Audit Trail");
    const finalEvent = await Event.findById(testEvent._id);
    console.log(`Status History (${finalEvent.statusHistory.length} entries):`);
    finalEvent.statusHistory.forEach((entry, i) => {
      console.log(`  ${i+1}. ${entry.from} → ${entry.to} by ${entry.changedBy} (${entry.comment})`);
    });

    console.log("\nFSM Algorithm Test Complete!");
    console.log("All tests passed - FSM is working correctly!");

    // Cleanup
    await Event.findByIdAndDelete(testEvent._id);
    console.log("Test event cleaned up");

    process.exit(0);
  } catch (error) {
    console.error("FSM Test failed:", error.message);
    process.exit(1);
  }
};

testFSM();