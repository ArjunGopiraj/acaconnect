const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../frontend/public');
console.log('Logo directory:', logoPath);
console.log('Directory exists:', fs.existsSync(logoPath));

const logoFiles = ['istlogo.png', 'nirallogo.png', 'ceglogo.png', 'acalogoo.png'];

logoFiles.forEach(file => {
  const filePath = path.join(logoPath, file);
  console.log(`${file}: exists = ${fs.existsSync(filePath)}`);
  
  if (fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      console.log(`${file}: size = ${buffer.length} bytes, base64 length = ${base64.length}`);
    } catch (error) {
      console.log(`${file}: Error reading - ${error.message}`);
    }
  }
});