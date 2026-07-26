const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/Users');

const chatControllers = {
  // GET or CREATE conversation between viewer and owner for a room
  getOrCreateConversation: async (req, res) => {
    try {
      const { ownerId, roomId } = req.body;
      const viewerId = req.user?.id;

      if (!ownerId || !roomId) {
        return res.status(400).json({ success: false, error: 'Thiếu ownerId hoặc roomId.' });
      }

      if (String(viewerId) === String(ownerId)) {
        return res.status(400).json({ success: false, error: 'Không thể tự chat với chính mình.' });
      }

      // Look for existing conversation with these two participants and this room
      let conversation = await Conversation.findOne({
        participants: { $all: [viewerId, ownerId] },
        roomId: String(roomId),
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [viewerId, ownerId],
          roomId: String(roomId),
        });
        await conversation.save();
      }

      return res.json({ success: true, data: conversation });
    } catch (err) {
      console.error('getOrCreateConversation error:', err);
      return res.status(500).json({ success: false, error: 'Lỗi máy chủ.' });
    }
  },

  // GET messages for a conversation
  getMessages: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();

      return res.json({ success: true, data: messages });
    } catch (err) {
      console.error('getMessages error:', err);
      return res.status(500).json({ success: false, error: 'Lỗi máy chủ.' });
    }
  },

  // GET all conversations for the current logged-in user (inbox)
  getMyConversations: async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log(`📬 Getting conversations for user: ${userId}`);

      const conversations = await Conversation.find({
        participants: userId,
      }).sort({ updatedAt: -1 }).lean();

      console.log(`Found ${conversations.length} conversations`);

      // For each conversation, get the other participant info + latest message + unread count
      const enriched = await Promise.all(
        conversations.map(async (conv) => {
          // The other participant (not the current user)
          const otherParticipantId = conv.participants.find(
            (p) => String(p) !== String(userId)
          );

          let otherUser = null;
          if (otherParticipantId) {
            otherUser = await User.findById(otherParticipantId)
              .select('username email')
              .lean();
          }

          // Latest message
          const latestMessage = await Message.findOne({ conversationId: conv._id })
            .sort({ createdAt: -1 })
            .lean();

          // Count unread messages (messages after lastReadBy timestamp)
          // Get lastReadBy timestamp for this user
          let lastReadTime = new Date(0); // Default to epoch (all messages unread)
          
          if (conv.lastReadBy) {
            // Handle both Map and plain object
            if (conv.lastReadBy instanceof Map) {
              lastReadTime = conv.lastReadBy.get(String(userId)) || new Date(0);
            } else if (typeof conv.lastReadBy === 'object') {
              lastReadTime = conv.lastReadBy[String(userId)] || new Date(0);
            }
          }

          console.log(`Conversation ${conv._id}: lastReadTime = ${lastReadTime}`);

          // Count messages from OTHER users that are newer than lastReadTime
          const unreadCount = await Message.countDocuments({
            conversationId: conv._id,
            senderId: { $ne: userId }, // Not sent by current user
            createdAt: { $gt: lastReadTime }
          });

          console.log(`  Unread count: ${unreadCount}`);

          return {
            ...conv,
            otherUser: otherUser || { username: 'Người dùng', email: '' },
            latestMessage: latestMessage || null,
            unreadCount: unreadCount || 0,
          };
        })
      );

      // Calculate total unread
      const totalUnread = enriched.reduce((sum, conv) => sum + conv.unreadCount, 0);
      console.log(`📊 Total unread messages: ${totalUnread}`);

      return res.json({ success: true, data: enriched, totalUnread });
    } catch (err) {
      console.error('getMyConversations error:', err);
      return res.status(500).json({ success: false, error: 'Lỗi máy chủ.' });
    }
  },

  // Mark conversation as read
  markAsRead: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      console.log(`✅ Marking conversation ${conversationId} as read for user ${userId}`);

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy cuộc trò chuyện.' });
      }

      // Initialize lastReadBy if not exists
      if (!conversation.lastReadBy) {
        conversation.lastReadBy = new Map();
      }

      // Update lastReadBy for this user to current time
      const now = new Date();
      conversation.lastReadBy.set(String(userId), now);
      
      // Mark as modified (important for Map fields)
      conversation.markModified('lastReadBy');
      
      await conversation.save();

      console.log(`✅ Conversation marked as read at ${now}`);

      // Return updated unread count (should be 0 now)
      const unreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        createdAt: { $gt: now }
      });

      return res.json({ success: true, unreadCount });
    } catch (err) {
      console.error('markAsRead error:', err);
      return res.status(500).json({ success: false, error: 'Lỗi máy chủ.' });
    }
  },

  // Get total unread count for current user
  getTotalUnreadCount: async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log(`📊 Getting total unread count for user: ${userId}`);

      const conversations = await Conversation.find({
        participants: userId,
      }).lean();

      let totalUnread = 0;

      for (const conv of conversations) {
        // Get lastReadBy timestamp for this user
        let lastReadTime = new Date(0);
        
        if (conv.lastReadBy) {
          if (conv.lastReadBy instanceof Map) {
            lastReadTime = conv.lastReadBy.get(String(userId)) || new Date(0);
          } else if (typeof conv.lastReadBy === 'object') {
            lastReadTime = conv.lastReadBy[String(userId)] || new Date(0);
          }
        }

        // Count unread messages in this conversation
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          createdAt: { $gt: lastReadTime }
        });

        totalUnread += unreadCount;
      }

      console.log(`📊 Total unread: ${totalUnread}`);

      return res.json({ success: true, totalUnread });
    } catch (err) {
      console.error('getTotalUnreadCount error:', err);
      return res.status(500).json({ success: false, error: 'Lỗi máy chủ.' });
    }
  },
};

module.exports = chatControllers;
