require("dotenv").config();
const connectDB = require("./config/db");
const Event = require("./models/Events");
const User = require("./models/User");

const checkFSMEvents = async () => {
  try {
    await connectDB();
    
    console.log("CHECKING FSM TEST EVENTS\n");
    
    // Find all events with "FSM" in title
    const fsmEvents = await Event.find({ 
      title: { $regex: /FSM/i } 
    }).populate('created_by');
    
    if (fsmEvents.length === 0) {
      console.log("No FSM test events found");
      console.log("The test script cleaned up the test event after completion");
    } else {
      fsmEvents.forEach(event => {
        console.log(`Event: ${event.title}`);
        console.log(`Status: ${event.status}`);
        console.log(`Created by: ${event.created_by?.name}`);
        
        if (event.statusHistory && event.statusHistory.length > 0) {
          console.log(`Status History (${event.statusHistory.length} transitions):`);
          event.statusHistory.forEach((h, i) => {
            const date = new Date(h.timestamp).toLocaleString();
            console.log(`  ${i+1}. ${h.from} → ${h.to} by ${h.changedBy} (${date})`);
            if (h.comment) console.log(`     "${h.comment}"`);
          });
        }
        console.log("");
      });
    }
    
    // Check all published events
    console.log("ALL PUBLISHED EVENTS:");
    const publishedEvents = await Event.find({ status: "PUBLISHED" }).populate('created_by');
    
    if (publishedEvents.length === 0) {
      console.log("  No published events found");
    } else {
      publishedEvents.forEach(event => {
        console.log(`  ${event.title} - Created by: ${event.created_by?.name}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkFSMEvents();