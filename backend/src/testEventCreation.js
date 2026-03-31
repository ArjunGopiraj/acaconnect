require("dotenv").config();
const connectDB = require("./config/db");
const Event = require("./models/Events");
const User = require("./models/User");

const testEventCreation = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find event team user
    const user = await User.findOne({ email: "event@test.com" });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }
    console.log("User found:", user._id);

    // Test event data
    const eventData = {
      title: "Test Event",
      type: "Hackathon",
      date: new Date("2024-12-25"),
      time: "10:00",
      duration_hours: 3,
      venue: "Main Hall",
      expected_participants: 100,
      prize_pool: 50000,
      requirements: {
        volunteers_needed: 10,
        rooms_needed: 2,
        refreshments_needed: true,
        stationary_needed: true,
        goodies_needed: true,
        physical_certificate: true,
        trophies_needed: true
      },
      created_by: user._id,
      status: "CREATED"
    };

    console.log("Creating event with data:", JSON.stringify(eventData, null, 2));

    const event = await Event.create(eventData);
    console.log("✅ Event created successfully!");
    console.log("Event ID:", event._id);
    console.log("Event title:", event.title);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating event:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

testEventCreation();
