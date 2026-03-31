require("dotenv").config();
const connectDB = require("./src/config/db");
const EventType = require("./src/models/EventType");

const checkEventTypes = async () => {
  try {
    await connectDB();
    
    const eventTypes = await EventType.find({});
    console.log(`Found ${eventTypes.length} event types:`);
    eventTypes.forEach(type => {
      console.log(`- ${type.name}: ${type.description || 'No description'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
};

checkEventTypes();