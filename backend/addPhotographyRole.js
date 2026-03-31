require("dotenv").config();
const connectDB = require("./src/config/db");
const Role = require("./src/models/Role");

const addRole = async () => {
  try {
    await connectDB();
    const role = await Role.findOneAndUpdate(
      { name: "PHOTOGRAPHY" },
      { name: "PHOTOGRAPHY" },
      { upsert: true, new: true }
    );
    console.log("✅ PHOTOGRAPHY role created:", role._id);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addRole();
