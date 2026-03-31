const mongoose = require('mongoose');
require('dotenv').config();

const Attendance = require('./src/models/Attendance');
const Certificate = require('./src/models/Certificate');
const Participant = require('./src/models/Participant');
const Event = require('./src/models/Events');

const resetAttendanceForTesting = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Arjun Sundar and Choreo Night event
    const participant = await Participant.findOne({ name: 'Arjun Sundar' });
    const event = await Event.findOne({ title: 'Choreo Night' });

    if (!participant || !event) {
      console.log('❌ Participant or event not found');
      return;
    }

    console.log(`Found: ${participant.name} - ${event.title}`);

    // Delete any existing certificate
    const existingCert = await Certificate.findOne({
      participant_id: participant._id,
      event_id: event._id
    });

    if (existingCert) {
      const fs = require('fs');
      if (fs.existsSync(existingCert.certificate_path)) {
        fs.unlinkSync(existingCert.certificate_path);
        console.log('✅ Certificate file deleted');
      }
      await Certificate.findByIdAndDelete(existingCert._id);
      console.log('✅ Certificate record deleted');
    }

    // Reset attendance to ABSENT
    await Attendance.findOneAndUpdate(
      { 
        participant_id: participant._id,
        event_id: event._id 
      },
      { 
        attendance_status: 'ABSENT',
        marked_at: new Date(),
        notes: 'Reset for testing'
      },
      { upsert: true }
    );

    console.log('✅ Attendance reset to ABSENT');
    console.log('\\n🎯 Now you can:');
    console.log('1. Go to the techops dashboard');
    console.log('2. Find Arjun Sundar in the Choreo Night event participants');
    console.log('3. Mark his attendance as PRESENT');
    console.log('4. The certificate should auto-generate with your Canva template!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

resetAttendanceForTesting();