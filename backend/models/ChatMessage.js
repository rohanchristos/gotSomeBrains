const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxLength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

// Index for efficient querying
chatMessageSchema.index({ roomId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
