const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/chat', authMiddleware, chatbotController.chat);
router.post('/export-events', authMiddleware, chatbotController.exportEvents);

module.exports = router;
