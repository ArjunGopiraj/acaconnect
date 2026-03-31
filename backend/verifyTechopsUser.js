const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/college_events');

async function verifyAndFixTechopsUser() {
  try {
    // Check if TECHOPS role exists
    const techopsRole = await Role.findOne({ name: 'TECHOPS' });
    if (!techopsRole) {
      console.log('TECHOPS role not found. Creating...');
      const newRole = new Role({
        name: 'TECHOPS',
        description: 'Technical Operations team responsible for attendance management'
      });
      await newRole.save();
      console.log('TECHOPS role created');
    } else {
      console.log('TECHOPS role found:', techopsRole._id);
    }

    // Check if TECHOPS user exists
    let techopsUser = await User.findOne({ email: 'techops@test.com' });
    
    if (techopsUser) {
      console.log('TECHOPS user already exists. Updating...');
      // Update the user with correct role and password
      const hashedPassword = await bcrypt.hash('techops123', 10);
      const updatedRole = await Role.findOne({ name: 'TECHOPS' });
      
      techopsUser.password_hash = hashedPassword;
      techopsUser.role_id = updatedRole._id;
      await techopsUser.save();
      console.log('TECHOPS user updated successfully');
    } else {
      console.log('Creating new TECHOPS user...');
      // Create new user
      const hashedPassword = await bcrypt.hash('techops123', 10);
      const role = await Role.findOne({ name: 'TECHOPS' });
      
      techopsUser = new User({
        name: 'Techops Team',
        email: 'techops@test.com',
        password_hash: hashedPassword,
        role_id: role._id,
        department: 'Technical Operations',
        mobile: '9876543210'
      });
      
      await techopsUser.save();
      console.log('TECHOPS user created successfully');
    }

    // Verify the user can be found and role is correct
    const verifyUser = await User.findOne({ email: 'techops@test.com' }).populate('role_id');
    console.log('\nVerification:');
    console.log('User found:', !!verifyUser);
    console.log('User name:', verifyUser?.name);
    console.log('User email:', verifyUser?.email);
    console.log('User role:', verifyUser?.role_id?.name);
    
    // Test password
    const passwordMatch = await bcrypt.compare('techops123', verifyUser.password_hash);
    console.log('Password test:', passwordMatch ? 'PASS' : 'FAIL');
    
    console.log('\nLogin credentials:');
    console.log('Email: techops@test.com');
    console.log('Password: techops123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

verifyAndFixTechopsUser();