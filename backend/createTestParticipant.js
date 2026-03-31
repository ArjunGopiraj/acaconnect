const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-events')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Participant Schema
const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  mobile: { type: String, required: true },
  college: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

const Participant = mongoose.model('Participant', participantSchema);

async function createTestParticipant() {
  try {
    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ email: 'arjun.sundar@test.com' });
    
    if (existingParticipant) {
      console.log('Participant already exists, updating...');
      existingParticipant.isVerified = true;
      existingParticipant.otp = undefined;
      existingParticipant.otpExpiry = undefined;
      await existingParticipant.save();
      console.log('✅ Participant updated and verified');
    } else {
      // Create new participant
      const password_hash = await bcrypt.hash('participant123', 10);
      
      const participant = new Participant({
        name: 'Arjun Sundar',
        email: 'arjun.sundar@test.com',
        password_hash,
        mobile: '9876543210',
        college: 'College of Engineering Guindy',
        department: 'Computer Science Engineering',
        year: '3rd Year',
        isVerified: true // Skip OTP verification for testing
      });
      
      await participant.save();
      console.log('✅ Test participant created successfully');
    }
    
    console.log('Participant details:');
    console.log('Email: arjun.sundar@test.com');
    console.log('Password: participant123');
    console.log('Name: Arjun Sundar');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating participant:', error);
    process.exit(1);
  }
}

createTestParticipant();