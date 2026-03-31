require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./src/models/Events");

async function checkEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check all events and their statuses
    const allEvents = await Event.find({}).select('title status date logistics');
    console.log("\n=== ALL EVENTS ===");
    allEvents.forEach(event => {
      console.log(`Title: ${event.title}`);
      console.log(`Status: ${event.status}`);
      console.log(`Date: ${event.date}`);
      console.log(`Logistics Acknowledged: ${event.logistics?.requirements_acknowledged || false}`);
      console.log(`Expense Submitted: ${event.logistics?.expense_submitted || false}`);
      console.log("---");
    });

    // Check specifically for PUBLISHED events
    const publishedEvents = await Event.find({ status: 'PUBLISHED' });
    console.log(`\n=== PUBLISHED EVENTS COUNT: ${publishedEvents.length} ===`);

    // Check for events that might be in other statuses
    const statusCounts = await Event.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("\n=== STATUS DISTRIBUTION ===");
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkEvents();