const mongoose = require('mongoose');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Certificate = require('./src/models/Certificate');
const Event = require('./src/models/Events');
const Participant = require('./src/models/Participant');
const Attendance = require('./src/models/Attendance');

const testCertificateSystem = async () => {
  try {
    console.log('🧪 Testing Complete Certificate System with Canva Template...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if template exists
    const templatePath = path.join(__dirname, 'certificate-template.pdf');
    if (!fs.existsSync(templatePath)) {
      console.log('❌ Certificate template not found!');
      return;
    }
    console.log('✅ Certificate template found');
    
    // Test template form fields
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`✅ Template has ${fields.length} form fields:`);
    fields.forEach(field => {
      console.log(`   - ${field.getName()}`);
    });
    
    // Get a sample attendance record
    const sampleAttendance = await Attendance.findOne({ attendance_status: 'PRESENT' })
      .populate('participant_id')
      .populate('event_id');
    
    if (!sampleAttendance) {
      console.log('❌ No attendance records found for testing');
      return;
    }
    
    console.log(`✅ Found sample attendance: ${sampleAttendance.participant_id.name} - ${sampleAttendance.event_id.title}`);
    
    // Test certificate generation
    const participant = sampleAttendance.participant_id;
    const event = sampleAttendance.event_id;
    
    console.log('\\n🔧 Testing certificate generation...');
    
    // Load fresh template
    const testTemplateBytes = fs.readFileSync(templatePath);
    const testPdfDoc = await PDFDocument.load(testTemplateBytes);
    const testForm = testPdfDoc.getForm();
    
    // Fill form fields
    const participantField = testForm.getTextField('participant_name');
    participantField.setText(participant.name);
    
    const collegeField = testForm.getTextField('college_name');
    collegeField.setText(participant.college);
    
    const eventField = testForm.getTextField('event_name');
    eventField.setText(event.title);
    
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateField = testForm.getTextField('event_date');
    dateField.setText(eventDate);
    
    // Flatten the form
    testForm.flatten();
    
    const finalPdfBytes = await testPdfDoc.save();
    
    // Save test certificate
    const certificatesDir = path.join(__dirname, 'uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    const testCertPath = path.join(certificatesDir, 'system_test_certificate.pdf');
    fs.writeFileSync(testCertPath, finalPdfBytes);
    
    console.log('✅ Certificate generation successful');
    console.log(`📄 Test certificate saved: ${testCertPath}`);
    
    // Check existing certificates
    const existingCerts = await Certificate.countDocuments();
    console.log(`\\n📊 Database Status:`);
    console.log(`   - Total certificates: ${existingCerts}`);
    
    const recentCerts = await Certificate.find().sort({ createdAt: -1 }).limit(3);
    console.log(`   - Recent certificates:`);
    recentCerts.forEach(cert => {
      console.log(`     • ${cert.participant_name} - ${cert.event_name}`);
    });
    
    console.log('\\n🎉 Certificate system test completed successfully!');
    console.log('✅ Canva template is working correctly');
    console.log('✅ Form fields are being filled properly');
    console.log('✅ PDF generation is functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
};

testCertificateSystem();