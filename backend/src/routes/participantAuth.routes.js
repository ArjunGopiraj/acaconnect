const express = require('express');
const router = express.Router();
const participantAuthController = require('../controllers/participantAuth.controller');

router.post('/signup', participantAuthController.signup);
router.post('/verify-otp', participantAuthController.verifyOTP);
router.post('/resend-otp', participantAuthController.resendOTP);
router.post('/login', participantAuthController.login);
router.post('/forgot-password', participantAuthController.forgotPassword);
router.post('/reset-password', participantAuthController.resetPassword);

module.exports = router;
