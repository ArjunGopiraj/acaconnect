const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-events')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Certificate = require('./src/models/Certificate');
const Attendance = require('./src/models/Attendance');
const Participant = require('./src/models/Participant');
const Event = require('./src/models/Events');

// Simple certificate HTML template
const generateCertificateHTML = ({ participantName, collegeName, eventName, eventDate }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Georgia', serif;
          background: linear-gradient(135deg, #1a0b2e 0%, #16213e 50%, #0f3460 100%);
          width: 297mm;
          height: 210mm;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
        }
        .certificate {
          width: 280mm;
          height: 190mm;
          background: linear-gradient(135deg, #1a0b2e 0%, #16213e 50%, #0f3460 100%);
          border: 8px solid #FFD700;
          border-radius: 20px;
          color: white;
          display: flex;
          flex-direction: column;
          text-align: center;
          padding: 40px;
          box-sizing: border-box;
        }
        .title {
          font-size: 42px;
          font-weight: bold;
          color: #FFD700;
          margin-bottom: 20px;
          letter-spacing: 3px;
        }
        .subtitle {
          font-size: 18px;
          color: #00D4FF;
          margin-bottom: 30px;
          font-style: italic;
        }
        .participant-name {
          font-size: 36px;
          color: #FFD700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 20px 0;
          font-weight: bold;
        }
        .event-name {
          font-size: 28px;
          color: #00D4FF;
          margin: 20px 0;
          font-weight: bold;
        }
        .text {
          font-size: 20px;
          color: #E0E0E0;
          margin: 10px 0;
        }
        .college-name {
          color: #00D4FF;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <h1 class="title">CERTIFICATE OF PARTICIPATION</h1>
        <div class="subtitle">NIRAL 2026 - Technical Symposium</div>
        
        <p class="text">This is to certify that</p>
        <h2 class="participant-name">${participantName}</h2>
        <p class="text">from <span class="college-name">${collegeName}</span></p>
        
        <p class="text">has successfully participated in</p>
        <h3 class="event-name">${eventName}</h3>
        <p class="text">held on ${eventDate}</p>
      </div>
    </body>
    </html>
  `;
};

async function generateMissingCertificates() {
  try {
    console.log('🏆 Generating Missing Certificates...\n');
    
    // Find attendance records without certificates
    const attendanceRecords = await Attendance.find({ attendance_status: 'PRESENT' });
    
    for (const attendance of attendanceRecords) {
      const existingCert = await Certificate.findOne({
        participant_id: attendance.participant_id,
        event_id: attendance.event_id
      });
      
      if (!existingCert) {
        console.log(`Generating certificate for ${attendance.participant_name}...`);
        
        // Get participant and event details
        const participant = await Participant.findById(attendance.participant_id);
        const event = await Event.findById(attendance.event_id);
        
        if (participant && event) {
          // Generate certificate HTML
          const certificateHTML = generateCertificateHTML({
            participantName: participant.name,
            collegeName: participant.college,
            eventName: event.title,
            eventDate: new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });

          // Create certificates directory
          const certificatesDir = path.join(__dirname, 'uploads/certificates');
          if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
          }

          // Generate PDF
          const browser = await puppeteer.launch({ headless: true });
          const page = await browser.newPage();
          
          await page.setContent(certificateHTML, { waitUntil: 'networkidle0' });
          
          const filename = `certificate_${participant._id}_${event._id}_${Date.now()}.pdf`;
          const certificatePath = path.join(certificatesDir, filename);
          
          await page.pdf({
            path: certificatePath,
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
          });

          await browser.close();

          // Save certificate record
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
          console.log(`✅ Certificate generated for ${participant.name}`);
        }
      }
    }
    
    console.log('\n🎉 Certificate generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateMissingCertificates();