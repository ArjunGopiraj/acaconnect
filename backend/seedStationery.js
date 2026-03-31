require("dotenv").config();
const mongoose = require("mongoose");
const Stationery = require("./src/models/Stationery");

const defaultStationeryItems = [
  { name: "A4 sheets", unit: "sheets" },
  { name: "Chart papers", unit: "sheets" },
  { name: "Sticky notes", unit: "packs" },
  { name: "Pens", unit: "pieces" },
  { name: "Pencils", unit: "pieces" },
  { name: "Erasers", unit: "pieces" },
  { name: "Sharpeners", unit: "pieces" },
  { name: "Highlighters", unit: "pieces" },
  { name: "Sketch pens", unit: "sets" },
  { name: "Permanent markers", unit: "pieces" },
  { name: "Whiteboard markers", unit: "pieces" },
  { name: "Correction pens", unit: "pieces" },
  { name: "Paper clips", unit: "boxes" },
  { name: "Binder clips", unit: "boxes" },
  { name: "Stapler", unit: "pieces" },
  { name: "Staples", unit: "boxes" },
  { name: "Glue sticks", unit: "pieces" },
  { name: "Cellophane tape", unit: "rolls" },
  { name: "Double-sided tape", unit: "rolls" },
  { name: "Rubber bands", unit: "packs" },
  { name: "Folders / Files", unit: "pieces" },
  { name: "Envelopes", unit: "pieces" },
  { name: "Notepads", unit: "pieces" },
  { name: "Name slips / ID labels", unit: "sheets" },
  { name: "Attendance sheets", unit: "sheets" },
  { name: "Evaluation sheets", unit: "sheets" },
  { name: "Clipboards", unit: "pieces" }
];

async function seedStationery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Stationery.deleteMany({});
    console.log("Cleared existing stationery items");

    await Stationery.insertMany(defaultStationeryItems);
    console.log("Seeded default stationery items");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding stationery:", error);
    process.exit(1);
  }
}

seedStationery();