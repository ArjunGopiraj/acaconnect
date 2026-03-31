const mongoose = require('mongoose');
const { PDFDocument, rgb } = require('pdf-lib');
const { createCanvas } = require('canvas');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Certificate = require('./src/models/Certificate');
const Event = require('./src/models/Events');
const Participant = require('./src/models/Participant');
const Attendance = require('./src/models/Attendance');



const regenerateAllCertificates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all attendance records with PRESENT status
    const attendanceRecords = await Attendance.find({ attendance_status: 'PRESENT' })
      .populate('participant_id')
      .populate('event_id');

    console.log(`Found ${attendanceRecords.length} attendance records`);

    // Create certificates directory
    const certificatesDir = path.join(__dirname, 'uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    let generated = 0;
    let updated = 0;

    for (const attendance of attendanceRecords) {
      try {
        const participant = attendance.participant_id;
        const event = attendance.event_id;

        if (!participant || !event) continue;

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({
          participant_id: participant._id,
          event_id: event._id
        });

        if (existingCert) {
          console.log(`Updating certificate for ${participant.name} - ${event.title}`);
          // Delete old certificate file if it exists
          if (fs.existsSync(existingCert.certificate_path)) {
            fs.unlinkSync(existingCert.certificate_path);
          }
          // Delete the database record
          await Certificate.findByIdAndDelete(existingCert._id);
          updated++;
        } else {
          console.log(`Generating new certificate for ${participant.name} - ${event.title}`);
        }

        // Generate PDF using Canva form-fillable template
        const templatePath = path.join(__dirname, 'certificate-template.pdf');
        if (!fs.existsSync(templatePath)) {
          console.error('❌ Certificate template not found!');
          continue;
        }
        
        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        
        // Get the form
        const form = pdfDoc.getForm();
        
        // Fill form fields with proper error handling
        try {
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
          
          // Flatten the form so fields become regular text
          form.flatten();
          
        } catch (fieldError) {
          console.error(`Error filling form fields: ${fieldError.message}`);
          continue;
        }
        
        const finalPdfBytes = await pdfDoc.save();
        
        const filename = `certificate_${participant._id}_${event._id}_${Date.now()}.pdf`;
        const certificatePath = path.join(certificatesDir, filename);
        
        fs.writeFileSync(certificatePath, finalPdfBytes);

        // Save new certificate record
        const certificate = new Certificate({
          participant_id: participant._id,
          event_id: event._id,
          participant_name: participant.name,
          participant_college: participant.college,
          event_name: event.title,
          event_date: event.date,
          certificate_path: certificatePath,
          downloaded_at: new Date()
        });

        await certificate.save();
        generated++;

      } catch (error) {
        console.error(`Error processing certificate for ${attendance.participant_id?.name || 'Unknown'}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Certificate regeneration complete!`);
    console.log(`📊 Generated: ${generated} certificates`);
    console.log(`🔄 Updated: ${updated} existing certificates`);
    console.log(`✅ All certificates now use the new Canva template!`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

regenerateAllCertificates();