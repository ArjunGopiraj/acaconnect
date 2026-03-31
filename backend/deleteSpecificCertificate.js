const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Certificate = require('./src/models/Certificate');

const deleteCertificate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the specific certificate
    const certificate = await Certificate.findOne({
      participant_name: 'Arjun Sundar',
      event_name: 'Choreo Night'
    });

    if (!certificate) {
      console.log('❌ Certificate not found for Arjun Sundar - Choreo Night');
      return;
    }

    console.log('Found certificate:', certificate.participant_name, '-', certificate.event_name);
    console.log('Certificate path:', certificate.certificate_path);

    // Delete the PDF file if it exists
    if (fs.existsSync(certificate.certificate_path)) {
      fs.unlinkSync(certificate.certificate_path);
      console.log('✅ PDF file deleted');
    } else {
      console.log('⚠️ PDF file not found');
    }

    // Delete the database record
    await Certificate.findByIdAndDelete(certificate._id);
    console.log('✅ Certificate record deleted from database');

    console.log('🎉 Certificate successfully deleted! You can now regenerate it by marking attendance as PRESENT again.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

deleteCertificate();