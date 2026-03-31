const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const generateCertificateHTML = ({ participantName, collegeName, eventName, eventDate }) => {
  console.log('=== GENERATING CERTIFICATE HTML ===');
  
  // Convert logos to base64
  const logoPath = path.join(__dirname, '../frontend/public');
  console.log('Logo path:', logoPath);
  
  let istLogo = '';
  let niralLogo = '';
  let cegLogo = '';
  let acaLogo = '';
  
  try {
    console.log('Loading IST logo...');
    const istBuffer = fs.readFileSync(path.join(logoPath, 'istlogo.png'));
    istLogo = `data:image/png;base64,${istBuffer.toString('base64')}`;
    console.log('IST logo loaded, length:', istLogo.length);
    
    console.log('Loading NIRAL logo...');
    const niralBuffer = fs.readFileSync(path.join(logoPath, 'nirallogo.png'));
    niralLogo = `data:image/png;base64,${niralBuffer.toString('base64')}`;
    console.log('NIRAL logo loaded, length:', niralLogo.length);
    
    console.log('Loading CEG logo...');
    const cegBuffer = fs.readFileSync(path.join(logoPath, 'ceglogo.png'));
    cegLogo = `data:image/png;base64,${cegBuffer.toString('base64')}`;
    console.log('CEG logo loaded, length:', cegLogo.length);
    
    console.log('Loading ACA logo...');
    const acaBuffer = fs.readFileSync(path.join(logoPath, 'acalogoo.png'));
    acaLogo = `data:image/png;base64,${acaBuffer.toString('base64')}`;
    console.log('ACA logo loaded, length:', acaLogo.length);
    
  } catch (error) {
    console.log('Error loading logos:', error.message);
    return 'ERROR LOADING LOGOS';
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial; padding: 20px; }
    .header-logos { display: flex; gap: 20px; margin-bottom: 20px; }
    .org-logo { height: 55px; width: auto; }
    .main-logo { height: 70px; width: auto; }
  </style>
</head>
<body>
  <div class="header-logos">
    <img src="${istLogo}" alt="IST" class="org-logo" />
    <img src="${niralLogo}" alt="NIRAL" class="main-logo" />
    <img src="${cegLogo}" alt="CEG" class="org-logo" />
    <img src="${acaLogo}" alt="ACA" class="org-logo" />
  </div>
  <h1>CERTIFICATE OF PARTICIPATION</h1>
  <p>This is to certify that <strong>${participantName}</strong></p>
  <p>from <strong>${collegeName}</strong></p>
  <p>has participated in <strong>${eventName}</strong></p>
  <p>held on ${eventDate}</p>
</body>
</html>`;

  console.log('HTML generated with logos embedded');
  return html;
};

const testCertificate = async () => {
  try {
    console.log('Starting certificate test...');
    
    const certificateHTML = generateCertificateHTML({
      participantName: 'Test User',
      collegeName: 'Test College',
      eventName: 'Test Event',
      eventDate: 'January 1, 2024'
    });

    if (certificateHTML === 'ERROR LOADING LOGOS') {
      console.log('Failed to load logos');
      return;
    }

    const certificatesDir = path.join(__dirname, 'uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Setting HTML content...');
    await page.setContent(certificateHTML, { waitUntil: 'networkidle0' });
    
    const certificatePath = path.join(certificatesDir, 'test_certificate.pdf');
    
    console.log('Generating PDF...');
    await page.pdf({
      path: certificatePath,
      format: 'A4',
      landscape: true,
      printBackground: true
    });

    await browser.close();
    console.log('Test certificate generated:', certificatePath);

  } catch (error) {
    console.error('Error:', error);
  }
};

testCertificate();