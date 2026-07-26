import axiosJWT from '../../config/axiosJWT';

const chatApi = {
  // Get or create a conversation with the room owner
  getOrCreateConversation: async ({ ownerId, roomId }) => {
    const res = await axiosJWT.post('/api/chat/conversation', { ownerId, roomId });
    return res.data;
  },

  // Fetch message history for a conversation
  getMessages: async (conversationId) => {
    const res = await axiosJWT.get(`/api/chat/messages/${conversationId}`);
    return res.data;
  },

  // Fetch all conversations for the current user (inbox)
  getMyConversations: async () => {
    const res = await axiosJWT.get('/api/chat/conversations');
    return res.data;
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    const res = await axiosJWT.put(`/api/chat/conversations/${conversationId}/read`);
    return res.data;
  },

  // Get total unread count (NEW - using dedicated endpoint)
  getUnreadCount: async () => {
    try {
      const res = await axiosJWT.get('/api/chat/unread-count');
      return res.data?.totalUnread || 0;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      // Fallback: calculate from conversations
      try {
        const convRes = await axiosJWT.get('/api/chat/conversations');
        const conversations = convRes.data?.data || [];
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        return totalUnread;
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        return 0;
      }
    }
  },
};

export default chatApi;
