require("dotenv").config();
const connectDB = require("./src/config/db");
const Event = require("./src/models/Events");

const checkEvents = async () => {
  try {
    await connectDB();
    
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: "PUBLISHED" });
    const draftEvents = await Event.countDocuments({ status: "DRAFT" });
    
    console.log("\n=== EVENT DATABASE STATUS ===");
    console.log(`Total Events: ${totalEvents}`);
    console.log(`Published Events: ${publishedEvents}`);
    console.log(`Draft Events: ${draftEvents}`);
    console.log("============================\n");
    
    if (totalEvents > 0) {
      console.log("Event Titles:");
      const events = await Event.find().select('title status');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} - ${event.status}`);
      });
    } else {
      console.log("⚠️  No events found in database!");
      console.log("\nTo seed events, run: npm run seed-events");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking events:", error);
    process.exit(1);
  }
};

checkEvents();
