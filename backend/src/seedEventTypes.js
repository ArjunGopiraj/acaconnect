require("dotenv").config();
const connectDB = require("./config/db");
const EventType = require("./models/EventType");

const seedEventTypes = async () => {
  try {
    await connectDB();
    
    const eventTypes = [
      {
        name: "Hackathon",
        description: "Coding competition event",
        default_requirements: {
          volunteers_needed: 10,
          rooms_needed: 2,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: "Technical Workshop",
        description: "Hands-on technical training session",
        default_requirements: {
          volunteers_needed: 5,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: false
        }
      },
      {
        name: "Quiz Competition",
        description: "Knowledge-based quiz event",
        default_requirements: {
          volunteers_needed: 6,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: "Cultural Event",
        description: "Cultural performance and activities",
        default_requirements: {
          volunteers_needed: 15,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: false,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: "Sports Event",
        description: "Athletic competition",
        default_requirements: {
          volunteers_needed: 12,
          rooms_needed: 0,
          refreshments_needed: true,
          stationary_needed: false,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: "Seminar",
        description: "Educational talk or presentation",
        default_requirements: {
          volunteers_needed: 4,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: false,
          trophies_needed: false
        }
      },
      {
        name: "Conference",
        description: "Multi-session professional gathering",
        default_requirements: {
          volunteers_needed: 20,
          rooms_needed: 3,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: false
        }
      }
    ];

    for (const type of eventTypes) {
      await EventType.findOneAndUpdate(
        { name: type.name },
        type,
        { upsert: true, new: true }
      );
    }

    console.log("✅ Event types seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Event type seeding failed:", error);
    process.exit(1);
  }
};

seedEventTypes();
