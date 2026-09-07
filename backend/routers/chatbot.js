const express = require('express');
const { faqController } = require('../controllers/faqController');
const { chatbotRateLimit } = require('../middleware/chatbotRateLimit');

const router = express.Router();
router.post('/ask', chatbotRateLimit, faqController.ask);

module.exports = router;
