require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Role = require("./models/Role");
const bcrypt = require("bcryptjs");

const seedUsers = async () => {
  try {
    await connectDB();
    
    const testUsers = [
      { name: "Admin User", email: "admin@test.com", password: "admin123", role: "ADMIN" },
      { name: "Event Team", email: "event@test.com", password: "event123", role: "EVENT_TEAM" },
      { name: "Student User", email: "student@test.com", password: "student123", role: "STUDENT" },
      { name: "Treasurer", email: "treasurer@test.com", password: "treasurer123", role: "TREASURER" },
      { name: "General Secretary", email: "gensec@test.com", password: "gensec123", role: "GENERAL_SECRETARY" },
      { name: "Chairperson", email: "chair@test.com", password: "chair123", role: "CHAIRPERSON" }
    ];

    for (const userData of testUsers) {
      const roleObj = await Role.findOne({ name: userData.role });
      
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create({
          name: userData.name,
          email: userData.email,
          password_hash: await bcrypt.hash(userData.password, 10),
          role_id: roleObj._id
        });
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log("\nTest users created successfully!");
    console.log("\nLogin credentials:");
    testUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("User seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();