const express = require('express');
const router = express.Router();
const techopsController = require('../controllers/techops.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// All routes require authentication and TECHOPS role
router.use(auth);
router.use(role('TECHOPS')); // Fixed: pass string directly instead of array

// Get all published events
router.get('/events', techopsController.getEvents);

// Get participants for a specific event
router.get('/events/:eventId/participants', techopsController.getEventParticipants);

// Mark attendance for a participant
router.post('/events/:eventId/attendance', techopsController.markAttendance);

// Bulk mark attendance
router.post('/events/:eventId/attendance/bulk', techopsController.bulkMarkAttendance);

// Onsite registration
router.post('/onsite-registration', techopsController.onsiteRegistration);

// Get onsite registrations history
router.get('/onsite-registrations', techopsController.getOnsiteRegistrations);

// Get onsite registration statistics
router.get('/onsite-registrations/stats', techopsController.getOnsiteStats);

// Update onsite registration status
router.put('/onsite-registrations/:registrationId/status', techopsController.updateOnsiteRegistrationStatus);

module.exports = router;