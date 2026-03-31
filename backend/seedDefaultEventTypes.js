require("dotenv").config();
const connectDB = require("./src/config/db");
const EventType = require("./src/models/EventType");

const seedEventTypes = async () => {
  try {
    await connectDB();
    
    const defaultTypes = [
      {
        name: 'Technical',
        description: 'Technical events and competitions',
        default_requirements: {
          volunteers_needed: 5,
          rooms_needed: 2,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: 'Non-Technical',
        description: 'Non-technical events and activities',
        default_requirements: {
          volunteers_needed: 3,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: false,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: 'Hackathon',
        description: 'Coding competitions and hackathons',
        default_requirements: {
          volunteers_needed: 8,
          rooms_needed: 3,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        }
      },
      {
        name: 'Seminar',
        description: 'Educational seminars and talks',
        default_requirements: {
          volunteers_needed: 2,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: false
        }
      },
      {
        name: 'Workshop',
        description: 'Hands-on workshops and training',
        default_requirements: {
          volunteers_needed: 4,
          rooms_needed: 2,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: false
        }
      }
    ];

    for (const typeData of defaultTypes) {
      const existing = await EventType.findOne({ name: typeData.name });
      if (!existing) {
        await EventType.create(typeData);
        console.log(`Created event type: ${typeData.name}`);
      } else {
        console.log(`Event type already exists: ${typeData.name}`);
      }
    }

    console.log("\nDefault event types seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Event type seeding failed:", error);
    process.exit(1);
  }
};

seedEventTypes();