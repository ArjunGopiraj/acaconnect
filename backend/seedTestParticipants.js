require("dotenv").config();
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Role = require("./src/models/Role");
const Event = require("./src/models/Events");
const bcrypt = require("bcryptjs");

const testParticipants = [
  { name: "Rahul Sharma", email: "rahul.sharma@test.com", interests: ["Programming & Coding", "Database & SQL"] },
  { name: "Priya Patel", email: "priya.patel@test.com", interests: ["UI/UX Design", "Web Development"] },
  { name: "Amit Kumar", email: "amit.kumar@test.com", interests: ["Programming & Coding", "DSA & Problem Solving"] },
  { name: "Sneha Reddy", email: "sneha.reddy@test.com", interests: ["Creative & Marketing", "Photography & Media"] },
  { name: "Vikram Singh", email: "vikram.singh@test.com", interests: ["Database & SQL", "Cyber Security"] },
  { name: "Anjali Gupta", email: "anjali.gupta@test.com", interests: ["Management & Strategy", "Fun & Engagement"] },
  { name: "Rohan Mehta", email: "rohan.mehta@test.com", interests: ["Programming & Coding", "Web Development"] },
  { name: "Kavya Iyer", email: "kavya.iyer@test.com", interests: ["General Quiz", "Fun & Engagement"] },
  { name: "Arjun Nair", email: "arjun.nair@test.com", interests: ["Technical Quiz", "Programming & Coding"] },
  { name: "Divya Krishnan", email: "divya.krishnan@test.com", interests: ["Communication & Voice", "Project & Presentation"] }
];

// Event registration patterns (which events each user would register for)
const registrationPatterns = {
  "rahul.sharma@test.com": ["SQL WAR", "DEBUGGING WITH DSA", "TECHNICAL CONNECTIONS"],
  "priya.patel@test.com": ["UI/UX DEVELOPMENT", "PITCH YOUR PROJECT CUM PRESENTATION"],
  "amit.kumar@test.com": ["DEBUGGING WITH DSA", "TECHNICAL CONNECTIONS", "SQL WAR"],
  "sneha.reddy@test.com": ["ADZAP", "PHOTOGRAPHY CONTEST", "PITCH YOUR PROJECT CUM PRESENTATION"],
  "vikram.singh@test.com": ["SQL WAR", "TECHNICAL CONNECTIONS"],
  "anjali.gupta@test.com": ["IPL AUCTION", "TREASURE HUNT", "ANIME / CINEMA QUIZ"],
  "rohan.mehta@test.com": ["UI/UX DEVELOPMENT", "TECHNICAL CONNECTIONS", "SQL WAR"],
  "kavya.iyer@test.com": ["ANIME / CINEMA QUIZ", "TREASURE HUNT", "Choreo Night"],
  "arjun.nair@test.com": ["TECHNICAL CONNECTIONS", "DEBUGGING WITH DSA", "Tech Quiz Challenge"],
  "divya.krishnan@test.com": ["PITCH YOUR PROJECT CUM PRESENTATION", "ADZAP", "Choreo Night"]
};

const seedTestParticipants = async () => {
  try {
    await connectDB();
    
    console.log("\n" + "=".repeat(70));
    console.log("SEEDING TEST PARTICIPANTS FOR COLLABORATIVE FILTERING");
    console.log("=".repeat(70));
    
    // Get PARTICIPANT role
    const participantRole = await Role.findOne({ name: "PARTICIPANT" });
    if (!participantRole) {
      console.error("❌ PARTICIPANT role not found. Please run seedRoles.js first.");
      process.exit(1);
    }
    
    // Get all published events
    const publishedEvents = await Event.find({ status: "PUBLISHED" });
    console.log(`\n✓ Found ${publishedEvents.length} published events`);
    
    // Create event name to ID mapping
    const eventMap = {};
    publishedEvents.forEach(event => {
      eventMap[event.title] = event._id;
    });
    
    console.log("\n" + "-".repeat(70));
    console.log("Creating test participants...");
    console.log("-".repeat(70));
    
    const hashedPassword = await bcrypt.hash("test123", 10);
    let createdCount = 0;
    
    for (const participant of testParticipants) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: participant.email });
      
      if (existingUser) {
        console.log(`⚠️  ${participant.name} (${participant.email}) - Already exists, skipping`);
        continue;
      }
      
      // Create user
      const user = await User.create({
        name: participant.name,
        email: participant.email,
        password_hash: hashedPassword,
        role_id: participantRole._id
      });
      
      createdCount++;
      console.log(`✓ Created: ${participant.name} (${participant.email})`);
      console.log(`  Interests: ${participant.interests.join(", ")}`);
      
      // Show which events they would register for
      const eventNames = registrationPatterns[participant.email] || [];
      if (eventNames.length > 0) {
        console.log(`  Would register for: ${eventNames.join(", ")}`);
      }
      console.log();
    }
    
    console.log("=".repeat(70));
    console.log(`✓ Created ${createdCount} new test participants`);
    console.log(`✓ Total participants: ${testParticipants.length}`);
    console.log("=".repeat(70));
    
    console.log("\n📋 TEST CREDENTIALS:");
    console.log("-".repeat(70));
    testParticipants.forEach(p => {
      console.log(`${p.name}: ${p.email} / test123`);
    });
    
    console.log("\n📊 REGISTRATION PATTERNS (for CF testing):");
    console.log("-".repeat(70));
    console.log("These patterns show which events each user would register for.");
    console.log("This creates the user-event interaction matrix needed for CF.");
    console.log("\nPattern Summary:");
    Object.entries(registrationPatterns).forEach(([email, events]) => {
      const user = testParticipants.find(p => p.email === email);
      console.log(`\n${user.name}:`);
      events.forEach(event => console.log(`  - ${event}`));
    });
    
    console.log("\n" + "=".repeat(70));
    console.log("🎯 NEXT STEPS TO TEST COLLABORATIVE FILTERING:");
    console.log("=".repeat(70));
    console.log("1. Login as any test participant (password: test123)");
    console.log("2. Register for events matching their pattern");
    console.log("3. After multiple users register, CF will learn patterns");
    console.log("4. Example: Users who like 'SQL WAR' also like 'DEBUGGING WITH DSA'");
    console.log("5. CF will recommend events based on similar users' behavior");
    console.log("\n⚠️  NOTE: CF needs actual registrations stored in database.");
    console.log("   Currently, your system doesn't store registrations yet.");
    console.log("   You'll need to implement registration storage first.");
    console.log("=".repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedTestParticipants();
