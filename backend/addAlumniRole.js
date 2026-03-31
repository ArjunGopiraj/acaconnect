require("dotenv").config();
const connectDB = require("./src/config/db");
const Role = require("./src/models/Role");

const addAlumniRole = async () => {
  try {
    await connectDB();
    
    const role = await Role.findOneAndUpdate(
      { name: "ALUMNI" },
      { name: "ALUMNI" },
      { upsert: true, new: true }
    );

    console.log("✅ ALUMNI role created:", role._id);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addAlumniRole();
