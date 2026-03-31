const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');

const testCanvaCertificate = async () => {
  try {
    console.log('🧪 Testing Canva Certificate Generation...\n');
    
    // Test data
    const testData = {
      participantName: 'John Doe',
      collegeName: 'Anna University',
      eventName: 'Tech Hackathon 2024',
      eventDate: 'December 20, 2024'
    };
    
    // Load the Canva template
    const templatePath = path.join(__dirname, 'certificate-template.pdf');
    console.log('Loading template from:', templatePath);
    
    if (!fs.existsSync(templatePath)) {
      console.log('❌ Template file not found!');
      return;
    }
    
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the form
    const form = pdfDoc.getForm();
    
    // Fill form fields
    console.log('Filling form fields...');
    
    const participantField = form.getTextField('participant_name');
    participantField.setText(testData.participantName);
    console.log('✅ Participant name filled');
    
    const collegeField = form.getTextField('college_name');
    collegeField.setText(testData.collegeName);
    console.log('✅ College name filled');
    
    const eventField = form.getTextField('event_name');
    eventField.setText(testData.eventName);
    console.log('✅ Event name filled');
    
    const dateField = form.getTextField('event_date');
    dateField.setText(testData.eventDate);
    console.log('✅ Event date filled');
    
    // Flatten the form so fields become regular text
    form.flatten();
    console.log('✅ Form flattened');
    
    // Save the final PDF
    const finalPdfBytes = await pdfDoc.save();
    
    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, 'uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    const outputPath = path.join(certificatesDir, 'test_canva_certificate.pdf');
    fs.writeFileSync(outputPath, finalPdfBytes);
    
    console.log(`\n🎉 Success! Certificate generated at: ${outputPath}`);
    console.log('The certificate should now have your Canva design with the filled data.');
    
  } catch (error) {
    console.error('❌ Error generating certificate:', error.message);
    console.error(error.stack);
  }
};

testCanvaCertificate();