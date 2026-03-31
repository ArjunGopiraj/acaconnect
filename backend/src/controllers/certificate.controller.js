const Certificate = require('../models/Certificate');
const Event = require('../models/Events');
const Participant = require('../models/Participant');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const ParticipantNotificationService = require('../services/participantNotification.service');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');

// Generate certificate for participant
const generateCertificate = async (req, res) => {
  try {
    console.log('=== GENERATE CERTIFICATE REQUEST ===');
    console.log('Params:', req.params);
    console.log('User:', req.user);
    
    const { participantId, eventId } = req.params;

    // Verify attendance is marked as PRESENT
    const attendance = await Attendance.findOne({
      participant_id: participantId,
      event_id: eventId,
      attendance_status: 'PRESENT'
    });

    console.log('Attendance found:', attendance ? 'Yes' : 'No');

    if (!attendance) {
      console.log('No attendance record found');
      return res.status(400).json({
        success: false,
        message: 'Certificate can only be generated for participants with marked attendance'
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      participant_id: participantId,
      event_id: eventId
    });

    console.log('Existing certificate:', certificate ? 'Found' : 'Not found');

    if (certificate) {
      console.log('Certificate path:', certificate.certificate_path);
      console.log('File exists:', require('fs').existsSync(certificate.certificate_path));
      
      // Update downloaded_at timestamp
      certificate.downloaded_at = new Date();
      await certificate.save();
      
      // Check if file exists, if not regenerate
      if (!require('fs').existsSync(certificate.certificate_path)) {
        console.log('PDF file missing, regenerating...');
        // Delete the certificate record and regenerate
        await Certificate.findByIdAndDelete(certificate._id);
        certificate = null;
      } else {
        // Return existing certificate
        console.log('Returning existing certificate file');
        return res.download(certificate.certificate_path, `certificate_${certificate.participant_name}_${certificate.event_name}.pdf`);
      }
    }

    // Get participant and event data
    const participant = await Participant.findById(participantId);
    const event = await Event.findById(eventId);

    if (!participant || !event) {
      return res.status(404).json({
        success: false,
        message: 'Participant or event not found'
      });
    }

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Generate PDF using form-fillable template
    const templatePath = path.join(__dirname, '../../certificate-template.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the form
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
    
    // Flatten the form so fields become regular text
    form.flatten();
    
    const finalPdfBytes = await pdfDoc.save();
    
    const filename = `certificate_${participantId}_${eventId}_${Date.now()}.pdf`;
    const certificatePath = path.join(certificatesDir, filename);
    
    fs.writeFileSync(certificatePath, finalPdfBytes);

    // Save certificate record to database
    certificate = new Certificate({
      participant_id: participantId,
      event_id: eventId,
      participant_name: participant.name,
      participant_college: participant.college,
      event_name: event.title,
      event_date: event.date,
      certificate_path: certificatePath,
      downloaded_at: new Date()
    });

    await certificate.save();

    // Notify participant about certificate generation
    try {
      await ParticipantNotificationService.notifyParticipant(
        participantId,
        `Your certificate for "${event.title}" has been generated! You can download it from My Certificates.`,
        eventId,
        'attendance'
      );
    } catch (e) { console.error('Certificate notification error:', e); }

    // Send PDF file as download
    res.download(certificatePath, `certificate_${participant.name}_${event.title}.pdf`);

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
};

// Get participant's certificates
const getParticipantCertificates = async (req, res) => {
  try {
    const participantId = req.user.id;

    const certificates = await Certificate.find({ participant_id: participantId })
      .populate('event_id', 'title date')
      .sort({ generated_at: -1 });

    res.json({
      success: true,
      certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
};



// Direct download certificate by ID
const downloadCertificate = async (req, res) => {
  try {
    console.log('=== DOWNLOAD CERTIFICATE ===');
    console.log('Certificate ID:', req.params.certificateId);
    console.log('User:', req.user);
    
    const certificate = await Certificate.findById(req.params.certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Verify this certificate belongs to the authenticated participant
    if (certificate.participant_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    console.log('Certificate path:', certificate.certificate_path);
    console.log('File exists:', require('fs').existsSync(certificate.certificate_path));
    
    // Check if file exists
    if (!require('fs').existsSync(certificate.certificate_path)) {
      console.log('PDF file missing, generating new one...');
      
      // Generate new certificate
      const participant = await Participant.findById(certificate.participant_id);
      const event = await Event.findById(certificate.event_id);
      
      if (!participant || !event) {
        return res.status(404).json({
          success: false,
          message: 'Participant or event not found'
        });
      }
      
      // Check if template file exists
      const templatePath = path.join(__dirname, '../../certificate-template.pdf');
      if (!fs.existsSync(templatePath)) {
        return res.status(500).json({
          success: false,
          message: 'Certificate template not found'
        });
      }
      
      // Generate PDF using Canva form-fillable template
      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // Get the form
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
      
      // Flatten the form so fields become regular text
      form.flatten();
      
      const finalPdfBytes = await pdfDoc.save();
      fs.writeFileSync(certificate.certificate_path, finalPdfBytes);
      console.log('New PDF generated');
    }
    
    // Update downloaded_at timestamp
    certificate.downloaded_at = new Date();
    await certificate.save();
    
    // Send PDF file as download
    console.log('Sending file download');
    res.download(certificate.certificate_path, `certificate_${certificate.participant_name}_${certificate.event_name}.pdf`);
    
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
};

module.exports = {
  generateCertificate,
  getParticipantCertificates,
  downloadCertificate
};