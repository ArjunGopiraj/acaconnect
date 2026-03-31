require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Role = require("./src/models/Role");
const bcrypt = require("bcryptjs");

const users = [
  { role: "DESIGN", name: "Design User", email: "design@test.com", password: "design123" },
  { role: "MARKETING", name: "Marketing User", email: "marketing@test.com", password: "marketing123" }
];

const addUsers = async () => {
  try {
    await connectDB();

    for (const u of users) {
      const role = await Role.findOne({ name: u.role });
      if (!role) {
        console.error(`❌ ${u.role} role not found. Run addDesignMarketingRoles.js first.`);
        continue;
      }

      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      await User.create({
        name: u.name,
        email: u.email,
        password_hash: await bcrypt.hash(u.password, 10),
        role_id: role._id
      });
      console.log(`✅ ${u.role} user created: ${u.email} / ${u.password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addUsers();
