require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Role = require("./src/models/Role");
const bcrypt = require("bcryptjs");

const addAlumniUser = async () => {
  try {
    await connectDB();

    const role = await Role.findOne({ name: "ALUMNI" });
    if (!role) {
      console.error("❌ ALUMNI role not found. Run addAlumniRole.js first.");
      process.exit(1);
    }

    const existing = await User.findOne({ email: "alumni@test.com" });
    if (existing) {
      console.log("User already exists: alumni@test.com");
      process.exit(0);
    }

    await User.create({
      name: "Alumni User",
      email: "alumni@test.com",
      password_hash: await bcrypt.hash("alumni123", 10),
      role_id: role._id
    });

    console.log("✅ Alumni user created");
    console.log("Login: alumni@test.com / alumni123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addAlumniUser();
