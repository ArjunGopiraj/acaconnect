const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Participant = require('./src/models/Participant');

mongoose.connect('mongodb://localhost:27017/college_events');

async function checkPassword() {
  try {
    const participant = await Participant.findOne({ email: '2024179001@student.annauniv.edu' });
    
    if (!participant) {
      console.log('Participant not found');
      return;
    }
    
    console.log('Participant found:', participant.name);
    console.log('Is verified:', participant.isVerified);
    console.log('Password hash:', participant.password_hash);
    
    // Test common passwords
    const testPasswords = ['arjun123', 'password', '123456', 'arjun', 'participant123'];
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, participant.password_hash);
      console.log(`Password "${pwd}": ${isValid ? 'CORRECT' : 'incorrect'}`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkPassword();