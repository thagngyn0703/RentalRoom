const router = require('express').Router();
const chatControllers = require('../controllers/chatControllers');
const { verifyToken } = require('../middleware/middlewareControllers');

// Get all conversations for the logged-in user (inbox)
router.get('/conversations', verifyToken, chatControllers.getMyConversations);

// Get total unread count
router.get('/unread-count', verifyToken, chatControllers.getTotalUnreadCount);

// Get or create a conversation (requires auth)
router.post('/conversation', verifyToken, chatControllers.getOrCreateConversation);

// Get messages for a conversation (requires auth)
router.get('/messages/:conversationId', verifyToken, chatControllers.getMessages);

// Mark conversation as read
router.put('/conversations/:conversationId/read', verifyToken, chatControllers.markAsRead);

module.exports = router;
