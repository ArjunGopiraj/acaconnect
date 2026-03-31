require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Role = require("./src/models/Role");

const checkUsers = async () => {
  try {
    await connectDB();
    
    const users = await User.find().populate('role_id', 'name');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role_id?.name || 'No role'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
};

checkUsers();