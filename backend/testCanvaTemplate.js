const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const testCanvaTemplate = async () => {
  try {
    console.log('🔍 Testing Canva Certificate Template...\n');
    
    const templatePath = './certificate-template.pdf';
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the form
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} form fields:`);
    fields.forEach((field, index) => {
      console.log(`${index + 1}. ${field.getName()} (${field.constructor.name})`);
    });
    
    if (fields.length === 0) {
      console.log('❌ No form fields found in PDF template!');
      console.log('The PDF might not be form-fillable or fields have different names.');
      return;
    }
    
    // Try to fill the fields with test data
    console.log('\n🧪 Testing field filling...');
    
    const testData = {
      'participant_name': 'John Doe',
      'college_name': 'Test College',
      'event_name': 'Sample Event',
      'event_date': 'December 20, 2024'
    };
    
    // Try different possible field names
    const possibleNames = [
      ['participant_name', 'participantName', 'participant', 'name'],
      ['college_name', 'collegeName', 'college', 'institution'],
      ['event_name', 'eventName', 'event', 'title'],
      ['event_date', 'eventDate', 'date', 'eventdate']
    ];
    
    fields.forEach(field => {
      const fieldName = field.getName();
      console.log(`Trying to fill field: ${fieldName}`);
      
      if (field.constructor.name === 'PDFTextField') {
        // Try to match field name with our test data
        let filled = false;
        for (const [key, value] of Object.entries(testData)) {
          if (fieldName.toLowerCase().includes(key.split('_')[0]) || 
              fieldName.toLowerCase().includes(key.split('_')[1] || '')) {
            field.setText(value);
            console.log(`✅ Filled ${fieldName} with: ${value}`);
            filled = true;
            break;
          }
        }
        if (!filled) {
          field.setText('TEST VALUE');
          console.log(`⚠️ Filled ${fieldName} with: TEST VALUE`);
        }
      }
    });
    
    // Save test certificate
    const finalPdfBytes = await pdfDoc.save();
    const testPath = './test_canva_certificate.pdf';
    fs.writeFileSync(testPath, finalPdfBytes);
    
    console.log(`\n✅ Test certificate generated: ${testPath}`);
    console.log('Check the generated PDF to see if fields were filled correctly.');
    
  } catch (error) {
    console.error('❌ Error testing template:', error.message);
  }
};

testCanvaTemplate();