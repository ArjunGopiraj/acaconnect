require("dotenv").config();
const connectDB = require("./src/config/db");
const EventType = require("./src/models/EventType");

const cleanupEventTypes = async () => {
  try {
    await connectDB();
    
    // Delete all existing event types
    const result = await EventType.deleteMany({});
    console.log(`Deleted ${result.deletedCount} old event types`);
    
    console.log("Event types cleanup completed!");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
};

cleanupEventTypes();