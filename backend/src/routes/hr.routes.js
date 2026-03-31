const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const {
  getEvents,
  acknowledgeVolunteerRequirements,
  updateVolunteerAllocation,
  deleteVolunteerAllocation
} = require('../controllers/hr.controller');

// All routes require HR role
router.get('/events', auth, role('HR'), getEvents);
router.post('/acknowledge/:eventId', auth, role('HR'), acknowledgeVolunteerRequirements);
router.put('/allocate/:eventId', auth, role('HR'), updateVolunteerAllocation);
router.delete('/allocate/:eventId', auth, role('HR'), deleteVolunteerAllocation);

module.exports = router;