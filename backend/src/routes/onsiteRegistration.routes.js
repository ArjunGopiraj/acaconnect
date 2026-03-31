const express = require('express');
const router = express.Router();
const onsiteRegistrationController = require('../controllers/onsiteRegistration.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Get all onsite registrations (Techops/Admin only)
router.get('/', 
  authenticate, 
  requireRole('TECHOPS', 'ADMIN', 'TREASURER'), 
  onsiteRegistrationController.getOnsiteRegistrations
);

// Get onsite registration statistics (Techops/Admin only)
router.get('/stats', 
  authenticate, 
  requireRole('TECHOPS', 'ADMIN', 'TREASURER'), 
  onsiteRegistrationController.getOnsiteStats
);

// Get pending onsite registrations for payment confirmation (Treasurer only)
router.get('/pending-payment', 
  authenticate, 
  requireRole('TREASURER'), 
  onsiteRegistrationController.getPendingOnsiteRegistrations
);

// Confirm onsite payment (Treasurer only)
router.post('/:registrationId/confirm-payment', 
  authenticate, 
  requireRole('TREASURER'), 
  onsiteRegistrationController.confirmOnsitePayment
);

// Update onsite registration status (Techops/Admin only - no payment confirmation)
router.put('/:registrationId/status', 
  authenticate, 
  requireRole('TECHOPS', 'ADMIN'), 
  onsiteRegistrationController.updateOnsiteRegistrationStatus
);

module.exports = router;