const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-events')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Certificate = require('./src/models/Certificate');
const Attendance = require('./src/models/Attendance');

async function checkCertificates() {
  try {
    console.log('🔍 Checking Certificate Generation...\n');
    
    // Check recent attendance records
    const recentAttendance = await Attendance.find({ attendance_status: 'PRESENT' })
      .sort({ marked_at: -1 })
      .limit(5);
    
    console.log(`Found ${recentAttendance.length} recent PRESENT attendance records:`);
    recentAttendance.forEach(att => {
      console.log(`- ${att.participant_name} for event ${att.event_id}`);
    });
    
    // Check certificates
    const certificates = await Certificate.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\nFound ${certificates.length} certificates:`);
    certificates.forEach(cert => {
      console.log(`- ${cert.participant_name} for ${cert.event_name}`);
    });
    
    // Check if certificates exist for recent attendance
    for (const att of recentAttendance) {
      const cert = await Certificate.findOne({
        participant_id: att.participant_id,
        event_id: att.event_id
      });
      
      console.log(`\n${att.participant_name}: ${cert ? '✅ Certificate exists' : '❌ No certificate'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCertificates();