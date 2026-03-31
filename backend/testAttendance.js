const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const Registration = require('./src/models/Registration');
const Attendance = require('./src/models/Attendance');

mongoose.connect('mongodb://localhost:27017/college_events');

async function testAttendanceMarking() {
  try {
    // Find the Tech Quiz Challenge event
    const event = await Event.findOne({ title: 'Tech Quiz Challenge' });
    console.log('Event found:', event ? event.title : 'Not found');
    
    if (!event) {
      console.log('No Tech Quiz Challenge event found');
      return;
    }
    
    // Find registrations for this event
    const registrations = await Registration.find({ 
      event_id: event._id,
      payment_status: 'COMPLETED'
    }).populate('participant_id', 'name email');
    
    console.log(`Found ${registrations.length} registrations`);
    registrations.forEach(reg => {
      console.log(`- ${reg.participant_id.name} (${reg.participant_id.email})`);
    });
    
    if (registrations.length > 0) {
      const firstReg = registrations[0];
      
      // Try to create an attendance record
      const attendanceData = {
        event_id: event._id,
        participant_id: firstReg.participant_id._id,
        registration_id: firstReg._id,
        participant_name: firstReg.participant_id.name,
        participant_email: firstReg.participant_id.email,
        attendance_status: 'PRESENT',
        marked_by: new mongoose.Types.ObjectId(), // Dummy user ID
        marked_at: new Date(),
        notes: 'Test attendance'
      };
      
      console.log('Attempting to create attendance record...');
      const attendance = await Attendance.create(attendanceData);
      console.log('Attendance record created successfully:', attendance);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAttendanceMarking();