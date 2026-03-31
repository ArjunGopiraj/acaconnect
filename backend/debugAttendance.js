const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./src/models/Events');
const Participant = require('./src/models/Participant');
const Registration = require('./src/models/Registration');
const Attendance = require('./src/models/Attendance');
const Certificate = require('./src/models/Certificate');

const debugAttendanceMarking = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the specific participant and event
    const participant = await Participant.findOne({ name: 'Arjun Sundar' });
    const event = await Event.findOne({ title: 'Choreo Night' });

    if (!participant || !event) {
      console.log('❌ Participant or event not found');
      return;
    }

    console.log(`Found: ${participant.name} - ${event.title}`);
    console.log(`Participant ID: ${participant._id}`);
    console.log(`Event ID: ${event._id}`);

    // Check registration
    const registration = await Registration.findOne({
      participant_id: participant._id,
      event_id: event._id,
      payment_status: 'COMPLETED'
    });

    if (!registration) {
      console.log('❌ No registration found');
      return;
    }

    console.log('✅ Registration found');

    // Check current attendance
    const currentAttendance = await Attendance.findOne({
      participant_id: participant._id,
      event_id: event._id
    });

    console.log('Current attendance:', currentAttendance?.attendance_status || 'Not marked');

    // Check existing certificates
    const existingCerts = await Certificate.find({
      participant_id: participant._id,
      event_id: event._id
    });

    console.log(`Existing certificates: ${existingCerts.length}`);
    existingCerts.forEach(cert => {
      console.log(`- Certificate ID: ${cert._id}`);
      console.log(`- Path: ${cert.certificate_path}`);
      console.log(`- Created: ${cert.createdAt}`);
    });

    // Check if template exists
    const fs = require('fs');
    const path = require('path');
    const templatePath = path.join(__dirname, 'certificate-template.pdf');
    console.log(`\\nTemplate check:`);
    console.log(`- Path: ${templatePath}`);
    console.log(`- Exists: ${fs.existsSync(templatePath)}`);

    if (fs.existsSync(templatePath)) {
      // Test template loading
      const { PDFDocument } = require('pdf-lib');
      try {
        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        console.log(`- Form fields: ${fields.length}`);
        fields.forEach(field => {
          console.log(`  • ${field.getName()}`);
        });
      } catch (error) {
        console.log(`❌ Template loading error: ${error.message}`);
      }
    }

    console.log('\\n🎯 Debug complete. Check server logs when marking attendance.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

debugAttendanceMarking();