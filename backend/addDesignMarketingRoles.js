require("dotenv").config();
const connectDB = require("./src/config/db");
const Role = require("./src/models/Role");

const addRoles = async () => {
  try {
    await connectDB();

    for (const name of ["DESIGN", "MARKETING"]) {
      const role = await Role.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true }
      );
      console.log(`✅ ${name} role created: ${role._id}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addRoles();
