require("dotenv").config();
const mongoose = require("mongoose");
const TechnicalItem = require("./src/models/TechnicalItem");
const RefreshmentItem = require("./src/models/RefreshmentItem");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

const seedItems = async () => {
  await connectDB();
  
  // Technical items from EventTeamDashboard
  const technicalItems = [
    { name: 'Projector', unit: 'pieces' },
    { name: 'Laptop', unit: 'pieces' },
    { name: '2 Cordless Microphones', unit: 'sets' },
    { name: 'Speakers', unit: 'pieces' },
    { name: 'HDMI / VGA cables', unit: 'pieces' },
    { name: 'Extension boards', unit: 'pieces' },
    { name: 'Power strips', unit: 'pieces' },
    { name: 'Power backup (UPS / Inverter)', unit: 'units' }
  ];

  // Refreshment items from EventTeamDashboard
  const refreshmentItems = [
    { name: 'Water bottles', unit: 'bottles' },
    { name: 'Tea', unit: 'cups' },
    { name: 'Coffee', unit: 'cups' },
    { name: 'Milk', unit: 'cups' },
    { name: 'Biscuits', unit: 'packets' },
    { name: 'Samosa / Puff / Cutlet', unit: 'pieces' },
    { name: 'Chips', unit: 'packets' },
    { name: 'Cake', unit: 'pieces' },
    { name: 'Fruit plates', unit: 'plates' },
    { name: 'Banana / Apple / Orange', unit: 'pieces' },
    { name: 'Juice packets', unit: 'packets' },
    { name: 'Packed snacks', unit: 'packets' },
    { name: 'Soft drinks', unit: 'bottles' },
    { name: 'Mineral water bottles', unit: 'bottles' },
    { name: 'Paper cups', unit: 'pieces' },
    { name: 'Disposable glasses', unit: 'pieces' },
    { name: 'Plates', unit: 'pieces' },
    { name: 'Tissues / Napkins', unit: 'packets' },
    { name: 'Trash bags', unit: 'pieces' }
  ];

  console.log("Seeding technical items...");
  for (const item of technicalItems) {
    const existing = await TechnicalItem.findOne({ name: item.name });
    if (!existing) {
      await TechnicalItem.create(item);
      console.log(`Created: ${item.name}`);
    }
  }

  console.log("Seeding refreshment items...");
  for (const item of refreshmentItems) {
    const existing = await RefreshmentItem.findOne({ name: item.name });
    if (!existing) {
      await RefreshmentItem.create(item);
      console.log(`Created: ${item.name}`);
    }
  }

  console.log("Seeding completed!");
  process.exit(0);
};

seedItems().catch(console.error);