const mongoose = require('mongoose');
const OnsiteRegistration = require('./src/models/OnsiteRegistration');
const Registration = require('./src/models/Registration');
const Participant = require('./src/models/Participant');
const Event = require('./src/models/Events');
require('dotenv').config();

async function migrateOnsiteRegistrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const confirmedOnsiteRegs = await OnsiteRegistration.find({ 
      status: 'PAYMENT_CONFIRMED' 
    }).populate('events.event_id');

    console.log(`Found ${confirmedOnsiteRegs.length} confirmed onsite registrations to migrate`);

    for (const registration of confirmedOnsiteRegs) {
      console.log(`Processing: ${registration.participant_details.name}`);

      // Check if participant exists, if not create one
      let participant = await Participant.findOne({ 
        email: registration.participant_details.email 
      });
      
      if (!participant) {
        participant = await Participant.create({
          name: registration.participant_details.name,
          email: registration.participant_details.email,
          mobile: registration.participant_details.phone,
          college: registration.participant_details.college,
          department: registration.participant_details.department,
          year: registration.participant_details.year,
          password_hash: 'onsite_' + Date.now()
        });
        console.log(`  Created participant: ${participant.email}`);
      }

      // Create regular registrations for each event
      for (const event of registration.events) {
        const existingReg = await Registration.findOne({
          event_id: event.event_id,
          participant_id: participant._id
        });

        if (!existingReg) {
          await Registration.create({
            event_id: event.event_id,
            participant_id: participant._id,
            participant_name: registration.participant_details.name,
            participant_email: registration.participant_details.email,
            registration_fee: event.registration_fee,
            payment_status: 'COMPLETED',
            payment_method: 'MOCK_PAYMENT',
            payment_id: `ONSITE_${registration._id}`,
            payment_date: registration.payment_confirmed_at || registration.created_at,
            verification_status: 'APPROVED',
            verified_by: registration.payment_confirmed_by,
            verification_date: registration.payment_confirmed_at || registration.created_at,
            verification_comments: 'Migrated onsite registration'
          });
          console.log(`  Created registration for event: ${event.event_title}`);
        }
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateOnsiteRegistrations();