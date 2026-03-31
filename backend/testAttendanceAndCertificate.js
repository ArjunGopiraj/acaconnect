const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./src/models/Events');
const Participant = require('./src/models/Participant');
const Registration = require('./src/models/Registration');
const Attendance = require('./src/models/Attendance');
const Certificate = require('./src/models/Certificate');

const testAttendanceAndCertificate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Arjun Sundar and Choreo Night event
    const participant = await Participant.findOne({ name: 'Arjun Sundar' });
    const event = await Event.findOne({ title: 'Choreo Night' });

    if (!participant) {
      console.log('❌ Arjun Sundar not found');
      return;
    }

    if (!event) {
      console.log('❌ Choreo Night event not found');
      return;
    }

    console.log(`✅ Found participant: ${participant.name}`);
    console.log(`✅ Found event: ${event.title}`);

    // Check if registration exists
    const registration = await Registration.findOne({
      participant_id: participant._id,
      event_id: event._id,
      payment_status: 'COMPLETED'
    });

    if (!registration) {
      console.log('❌ No completed registration found');
      return;
    }

    console.log('✅ Registration found');

    // Check current attendance status
    const currentAttendance = await Attendance.findOne({
      participant_id: participant._id,
      event_id: event._id
    });

    console.log('Current attendance status:', currentAttendance?.attendance_status || 'Not marked');

    // Mark attendance as PRESENT (simulate the controller logic)
    const attendanceData = {
      event_id: event._id,
      participant_id: participant._id,
      registration_id: registration._id,
      participant_name: participant.name,
      participant_email: participant.email,
      attendance_status: 'PRESENT',
      marked_by: participant._id, // Using participant ID as dummy techops user
      marked_at: new Date(),
      notes: 'Test attendance marking'
    };

    const attendance = await Attendance.findOneAndUpdate(
      { event_id: event._id, participant_id: participant._id },
      attendanceData,
      { upsert: true, new: true }
    );

    console.log('✅ Attendance marked as PRESENT');

    // Now trigger certificate generation (simulate the controller logic)
    console.log('\\n🔧 Starting certificate generation...');

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      participant_id: participant._id,
      event_id: event._id
    });

    if (existingCertificate) {
      console.log('⚠️ Certificate already exists, deleting it first...');
      // Delete existing certificate for testing
      const fs = require('fs');
      if (fs.existsSync(existingCertificate.certificate_path)) {
        fs.unlinkSync(existingCertificate.certificate_path);
      }
      await Certificate.findByIdAndDelete(existingCertificate._id);
      console.log('✅ Existing certificate deleted');
    }

    // Generate new certificate using Canva template
    const { PDFDocument } = require('pdf-lib');
    const path = require('path');
    const fs = require('fs');

    const templatePath = path.join(__dirname, 'certificate-template.pdf');
    console.log('Template path:', templatePath);
    console.log('Template exists:', fs.existsSync(templatePath));

    if (!fs.existsSync(templatePath)) {
      console.log('❌ Certificate template not found!');
      return;
    }

    // Load and fill PDF template
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // Fill form fields
    const participantField = form.getTextField('participant_name');
    participantField.setText(participant.name);

    const collegeField = form.getTextField('college_name');
    collegeField.setText(participant.college);

    const eventField = form.getTextField('event_name');
    eventField.setText(event.title);

    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateField = form.getTextField('event_date');
    dateField.setText(eventDate);

    form.flatten();
    const finalPdfBytes = await pdfDoc.save();

    // Create certificates directory
    const certificatesDir = path.join(__dirname, 'uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const filename = `certificate_${participant._id}_${event._id}_${Date.now()}.pdf`;
    const certificatePath = path.join(certificatesDir, filename);

    fs.writeFileSync(certificatePath, finalPdfBytes);
    console.log('✅ PDF written to:', certificatePath);

    // Create certificate record
    const certificate = new Certificate({
      participant_id: participant._id,
      event_id: event._id,
      participant_name: participant.name,
      participant_college: participant.college,
      event_name: event.title,
      event_date: event.date,
      certificate_path: certificatePath
    });
    await certificate.save();

    console.log('🎉 Certificate generated successfully!');
    console.log(`📄 Certificate saved: ${certificatePath}`);
    console.log(`📊 Database record created with ID: ${certificate._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
};

testAttendanceAndCertificate();