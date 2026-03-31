const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-events')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Certificate = require('./src/models/Certificate');

async function deleteCertificate() {
  try {
    const certificate = await Certificate.findOne({
      participant_name: 'Arjun Sundar',
      event_name: 'Choreo Night'
    });
    
    if (certificate) {
      // Delete PDF file if exists
      if (fs.existsSync(certificate.certificate_path)) {
        fs.unlinkSync(certificate.certificate_path);
        console.log('✅ PDF file deleted');
      }
      
      // Delete database record
      await Certificate.findByIdAndDelete(certificate._id);
      console.log('✅ Certificate record deleted');
    } else {
      console.log('❌ Certificate not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteCertificate();