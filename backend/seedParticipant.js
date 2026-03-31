require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Role = require("./src/models/Role");
const bcrypt = require("bcryptjs");

const seedParticipant = async () => {
  try {
    await connectDB();
    
    // Create PARTICIPANT role if it doesn't exist
    let participantRole = await Role.findOne({ name: "PARTICIPANT" });
    if (!participantRole) {
      participantRole = await Role.create({
        name: "PARTICIPANT",
        description: "Event participant with registration access"
      });
      console.log("Created PARTICIPANT role");
    }
    
    // Create participant user
    const existingUser = await User.findOne({ email: "participant@test.com" });
    if (!existingUser) {
      await User.create({
        name: "Participant User",
        email: "participant@test.com",
        password_hash: await bcrypt.hash("participant123", 10),
        role_id: participantRole._id
      });
      console.log("Created participant user: participant@test.com / participant123");
    } else {
      console.log("Participant user already exists");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Participant seeding failed:", error);
    process.exit(1);
  }
};

seedParticipant();