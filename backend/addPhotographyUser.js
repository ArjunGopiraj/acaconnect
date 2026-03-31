require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Role = require("./src/models/Role");
const bcrypt = require("bcryptjs");

const addUser = async () => {
  try {
    await connectDB();
    const role = await Role.findOne({ name: "PHOTOGRAPHY" });
    if (!role) { console.error("❌ PHOTOGRAPHY role not found. Run addPhotographyRole.js first."); process.exit(1); }

    const existing = await User.findOne({ email: "photography@test.com" });
    if (existing) { console.log("User already exists: photography@test.com"); process.exit(0); }

    await User.create({
      name: "Photography User",
      email: "photography@test.com",
      password_hash: await bcrypt.hash("photography123", 10),
      role_id: role._id
    });
    console.log("✅ Photography user created: photography@test.com / photography123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addUser();
