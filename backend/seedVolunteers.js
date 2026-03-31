const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_events').then(async () => {
  const Volunteer = require('./src/models/Volunteer');

  // Clear existing volunteers
  await Volunteer.deleteMany({});

  const volunteers = [
    { name: 'Vishnu', department: 'IST', contact: '9000000001' },
    { name: 'Arjun Nair', department: 'CS', contact: '9000000002' },
    { name: 'Karthik Subramanian', department: 'IST', contact: '9000000003' },
    { name: 'Vishnu Pillai', department: 'CS', contact: '9000000004' },
    { name: 'Hari Krishnan', department: 'IST', contact: '9000000005' },
    { name: 'Sreenath Menon', department: 'CS', contact: '9000000006' },
    { name: 'Rahul Raj', department: 'IST', contact: '9000000007' },
    { name: 'Adithya Narayanan', department: 'CS', contact: '9000000008' },
    { name: 'Manoj Kumar', department: 'IST', contact: '9000000009' },
    { name: 'Gokul Krishnan', department: 'CS', contact: '9000000010' },
    { name: 'Sanjay Prasad', department: 'IST', contact: '9000000011' },
    { name: 'Nithin Mathew', department: 'CS', contact: '9000000012' },
    { name: 'Akash Varma', department: 'IST', contact: '9000000013' },
    { name: 'Praveen Chandran', department: 'CS', contact: '9000000014' },
    { name: 'Dinesh Babu', department: 'IST', contact: '9000000015' },
    { name: 'Rakesh Nair', department: 'CS', contact: '9000000016' },
    { name: 'Sidharth S', department: 'IST', contact: '9000000017' },
    { name: 'Ajay Menon', department: 'CS', contact: '9000000018' },
    { name: 'Naveen Raj', department: 'IST', contact: '9000000019' },
    { name: 'Amal Dev', department: 'CS', contact: '9000000020' },
    { name: 'Bharath Kumar', department: 'IST', contact: '9000000021' }
  ];

  const result = await Volunteer.insertMany(volunteers);
  console.log(`Seeded ${result.length} volunteers successfully!`);
  result.forEach(v => console.log(`  - ${v.name} (${v.department})`));
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
