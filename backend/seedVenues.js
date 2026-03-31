const mongoose = require('mongoose');
const Venue = require('./src/models/Venue');

const MONGODB_URI = 'mongodb://localhost:27017/college_events';

const venues = [
  // Classrooms
  {
    name: 'G3 Ground Floor Classroom',
    type: 'Classroom',
    capacity: 60,
    equipment: ['Projector', 'Bench Desk', 'Whiteboard', 'Internet'],
    location: 'Ground Floor'
  },
  {
    name: 'F1 First Floor Classroom',
    type: 'Classroom',
    capacity: 60,
    equipment: ['Projector', 'Bench Desk', 'Whiteboard', 'Internet'],
    location: 'First Floor'
  },
  {
    name: 'S2 Second Floor Classroom',
    type: 'Classroom',
    capacity: 60,
    equipment: ['Projector', 'Bench Desk', 'Whiteboard', 'Internet'],
    location: 'Second Floor'
  },
  {
    name: 'T3 Third Floor Classroom',
    type: 'Classroom',
    capacity: 40,
    equipment: ['Projector', 'Bench Desk', 'Whiteboard', 'Internet'],
    location: 'Third Floor'
  },
  
  // Computer Labs
  {
    name: 'First Floor Lab',
    type: 'Computer Lab',
    capacity: 72,
    equipment: ['Projector', 'Computer System', 'Whiteboard', 'AC', 'Internet'],
    location: 'First Floor'
  },
  {
    name: 'Second Floor Lab',
    type: 'Computer Lab',
    capacity: 72,
    equipment: ['Projector', 'Computer System', 'Whiteboard', 'AC', 'Internet'],
    location: 'Second Floor'
  },
  {
    name: 'Third Floor Lab',
    type: 'Computer Lab',
    capacity: 72,
    equipment: ['Projector', 'Computer System', 'Whiteboard', 'AC', 'Internet'],
    location: 'Third Floor'
  },
  {
    name: 'Second Floor Annexure Lab',
    type: 'Computer Lab',
    capacity: 30,
    equipment: ['Computer System', 'AC', 'Internet'],
    location: 'Second Floor Annexure'
  },
  {
    name: 'Third Floor Annexure Lab',
    type: 'Computer Lab',
    capacity: 30,
    equipment: ['Computer System', 'AC', 'Internet'],
    location: 'Third Floor Annexure'
  },
  
  // Auditorium
  {
    name: 'Ada Lovelace Auditorium',
    type: 'Auditorium',
    capacity: 150,
    equipment: ['Chairs', 'Whiteboard', 'AC', 'Speaker', 'Microphone', 'Internet'],
    location: 'Main Building'
  },
  
  // Conference Room
  {
    name: 'Conference Hall',
    type: 'Conference Room',
    capacity: 15,
    equipment: ['Chair', 'Table', 'TV', 'AC', 'Internet'],
    location: 'Department'
  }
];

async function seedVenues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Venue.deleteMany({});
    console.log('Cleared existing venues');
    
    await Venue.insertMany(venues);
    console.log(`✅ Successfully seeded ${venues.length} venues!`);
    console.log('\nVenue Summary:');
    console.log('- Classrooms: 4 (Total capacity: 220)');
    console.log('- Computer Labs: 5 (Total capacity: 276)');
    console.log('- Auditorium: 1 (Capacity: 150)');
    console.log('- Conference Room: 1 (Capacity: 15)');
    console.log('- Total: 11 venues, 661 total capacity');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding venues:', error);
    process.exit(1);
  }
}

seedVenues();
