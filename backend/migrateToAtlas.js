require("dotenv").config();
const mongoose = require("mongoose");

const LOCAL_URI = "mongodb://localhost:27017/college_events";
const ATLAS_URI = process.argv[2];

if (!ATLAS_URI) {
  console.error("Usage: node migrateToAtlas.js <ATLAS_URI>");
  process.exit(1);
}

async function migrate() {
  // Connect to local
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log("Connected to LOCAL MongoDB");

  // Get all collection names
  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections:`, collections.map(c => c.name).join(", "));

  // Connect to Atlas
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log("Connected to ATLAS MongoDB");

  for (const col of collections) {
    const name = col.name;
    try {
      const docs = await localConn.db.collection(name).find({}).toArray();
      console.log(`\n${name}: ${docs.length} documents`);

      if (docs.length === 0) continue;

      // Clear existing data in Atlas for this collection
      await atlasConn.db.collection(name).deleteMany({});
      
      // Insert all documents
      await atlasConn.db.collection(name).insertMany(docs);
      console.log(`  ✅ Migrated ${docs.length} documents`);
    } catch (err) {
      console.error(`  ❌ Error migrating ${name}:`, err.message);
    }
  }

  await localConn.close();
  await atlasConn.close();
  console.log("\n✅ Migration complete!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
