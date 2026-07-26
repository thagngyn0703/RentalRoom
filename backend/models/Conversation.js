const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Exactly 2 participants: [viewerId, ownerId]
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    // The room this conversation is about
    roomId: { type: String, required: true },
    // Track last read message for each participant
    lastReadBy: {
      type: Map,
      of: Date,
      default: {}
    }
  },
  { timestamps: true }
);

// Ensure one conversation per (pair of users + room)
conversationSchema.index({ participants: 1, roomId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema, 'conversations');
