const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const participantAuthMiddleware = require('../middleware/participantAuth.middleware');

// Generate and download certificate (protected route for participants)
router.get('/generate/:participantId/:eventId', participantAuthMiddleware, certificateController.generateCertificate);

// Direct download certificate by ID
router.get('/download/:certificateId', participantAuthMiddleware, certificateController.downloadCertificate);

// Get participant's certificates
router.get('/my-certificates', participantAuthMiddleware, certificateController.getParticipantCertificates);

module.exports = router;