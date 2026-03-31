require("dotenv").config();
const connectDB = require("./config/db");
const Role = require("./models/Role");

const seedRoles = async () => {
  try {
    await connectDB();
    
    const roles = [
      "ADMIN",
      "CHAIRPERSON", 
      "GENERAL_SECRETARY",
      "TREASURER",
      "EVENT_TEAM",
      "LOGISTICS",
      "HR",
      "HOSPITALITY",
      "STUDENT",
      "ALUMNI",
      "DESIGN",
      "MARKETING",
      "PHOTOGRAPHY"
    ];

    for (const roleName of roles) {
      await Role.findOneAndUpdate(
        { name: roleName },
        { name: roleName },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Roles seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedRoles();