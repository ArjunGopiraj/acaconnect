const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Certificate = require('./src/models/Certificate');

const regenerateCertificates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all certificate files
    const certificatesDir = path.join(__dirname, 'uploads/certificates');
    if (fs.existsSync(certificatesDir)) {
      const files = fs.readdirSync(certificatesDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(certificatesDir, file));
      });
      console.log(`Deleted ${files.length} certificate files`);
    }

    // Delete all certificate records from database
    const result = await Certificate.deleteMany({});
    console.log(`Deleted ${result.deletedCount} certificate records from database`);

    console.log('All certificates cleared. New certificates will be generated with logos when requested.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

regenerateCertificates();