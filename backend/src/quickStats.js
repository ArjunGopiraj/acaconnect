require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Event = require("./models/Events");
const Notification = require("./models/Notification");

const quickStats = async () => {
  try {
    await connectDB();
    
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const notifCount = await Notification.countDocuments();
    
    const recentEvents = await Event.find({}).sort({createdAt: -1}).limit(3);
    
    console.log("QUICK DATABASE STATS");
    console.log(`Users: ${userCount}`);
    console.log(`Events: ${eventCount}`);
    console.log(`Notifications: ${notifCount}`);
    
    console.log("\nRecent Events:");
    recentEvents.forEach(event => {
      console.log(`  ${event.title} (${event.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

quickStats();