const express = require('express');
const { roomChatbotController } = require('../controllers/roomChatbotController');
const { chatbotRateLimit } = require('../middleware/chatbotRateLimit');

const router = express.Router();
router.post('/ask', chatbotRateLimit, roomChatbotController.ask);

module.exports = router;
