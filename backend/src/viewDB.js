require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Role = require("./models/Role");
const Event = require("./models/Events");
const Notification = require("./models/Notification");

const viewDatabase = async () => {
  try {
    await connectDB();
    console.log("DATABASE VIEWER\n");

    // View Roles
    console.log("ROLES:");
    const roles = await Role.find({});
    roles.forEach(role => {
      console.log(`  ${role.name} (ID: ${role._id})`);
    });

    // View Users
    console.log("\nUSERS:");
    const users = await User.find({}).populate('role_id');
    users.forEach(user => {
      console.log(`  ${user.name} - ${user.email} (${user.role_id?.name || 'No Role'})`);
    });

    // View Events
    console.log("\nEVENTS:");
    const events = await Event.find({}).populate('created_by');
    if (events.length === 0) {
      console.log("  No events found");
    } else {
      events.forEach(event => {
        console.log(`  ${event.title} - Status: ${event.status} - Created by: ${event.created_by?.name}`);
        if (event.statusHistory && event.statusHistory.length > 0) {
          console.log(`    History: ${event.statusHistory.length} transitions`);
          event.statusHistory.forEach((h, i) => {
            console.log(`      ${i+1}. ${h.from} → ${h.to} by ${h.changedBy}`);
          });
        }
      });
    }

    // View Notifications
    console.log("\nNOTIFICATIONS:");
    const notifications = await Notification.find({}).populate('user_id');
    if (notifications.length === 0) {
      console.log("  No notifications found");
    } else {
      notifications.slice(0, 5).forEach(notif => {
        console.log(`  ${notif.user_id?.name}: ${notif.message} (${notif.is_read ? 'Read' : 'Unread'})`);
      });
      if (notifications.length > 5) {
        console.log(`  ... and ${notifications.length - 5} more`);
      }
    }

    console.log("\nDatabase view complete!");
    process.exit(0);
  } catch (error) {
    console.error("Database view failed:", error.message);
    process.exit(1);
  }
};

viewDatabase();