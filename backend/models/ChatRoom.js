const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    default: null
  },
  doctorName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assessmentData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

// Index for efficient querying
chatRoomSchema.index({ status: 1, priority: -1, createdAt: 1 });
chatRoomSchema.index({ patientId: 1 });
chatRoomSchema.index({ doctorId: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
