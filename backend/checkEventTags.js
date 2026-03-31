const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/college_events');

const eventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

Event.findOne({ status: 'PUBLISHED' })
  .then(event => {
    console.log('Event tags:', event.tags);
    console.log('Event title:', event.title);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
