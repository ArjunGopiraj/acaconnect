require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function checkLogisticsUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check all users and their roles
    const allUsers = await User.find({}).select('name email role');
    console.log("\n=== ALL USERS ===");
    allUsers.forEach(user => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log("---");
    });

    // Check specifically for LOGISTICS users
    const logisticsUsers = await User.find({ role: 'LOGISTICS' });
    console.log(`\n=== LOGISTICS USERS COUNT: ${logisticsUsers.length} ===`);
    logisticsUsers.forEach(user => {
      console.log(`Name: ${user.name}, Email: ${user.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkLogisticsUsers();