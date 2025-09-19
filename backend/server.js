const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const UserAssessment = require('./models/UserAssessment');
const ChatMessage = require('./models/ChatMessage');
const ChatRoom = require('./models/ChatRoom');
const CustomMLModel = require('./ml/simplifiedMLModel');

console.log('Using Advanced Statistical ML Model (TensorFlow.js-compatible)');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3001;

// Initialize ML Model
const mlModel = new CustomMLModel();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Custom ML endpoint
app.post('/customML', async (req, res) => {
  try {
    console.log('Received CustomML assessment data:', req.body);
    
    const { assessment_type, responses, user_context, timestamp } = req.body;
    
    // Generate unique user ID if not provided
    const userId = uuidv4();
    
    // Check if ML model is ready
    if (!mlModel.isReady()) {
      return res.status(503).json({
        error: 'ML model is still initializing. Please try again in a few moments.',
        status: 'model_not_ready'
      });
    }

    // Process data through TensorFlow.js neural network
    const mlResults = await mlModel.predict(responses, user_context);
    
    console.log('ML Model Results:', mlResults);
    
    // Create assessment record
    const assessmentData = {
      userId: userId,
      assessmentType: assessment_type,
      responses: responses,
      userContext: user_context,
      mlScore: mlResults.mlScore,
      riskLevel: mlResults.riskLevel,
      recommendations: mlResults.recommendations,
      timestamp: new Date(timestamp)
    };
    
    // Save to MongoDB
    const userAssessment = new UserAssessment(assessmentData);
    await userAssessment.save();
    
    console.log('Assessment saved to database with ID:', userId);
    
    // Prepare response for frontend
    const response = {
      userId: userId,
      assessment_type: assessment_type,
      responses: responses,
      user_context: user_context,
      ml_results: {
        score: mlResults.mlScore,
        risk_level: mlResults.riskLevel,
        confidence: mlResults.confidence,
        recommendations: mlResults.recommendations
      },
      timestamp: timestamp,
      message: 'Assessment processed successfully'
    };
    
    console.log('Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('Error processing CustomML request:', error);
    res.status(500).json({
      error: 'Internal server error processing assessment',
      details: error.message
    });
  }
});


// Get user assessment results
app.get('/assessment/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessment = await UserAssessment.findOne({ userId: userId });
    
    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found for the provided user ID'
      });
    }
    
    res.json({
      userId: assessment.userId,
      assessment_type: assessment.assessmentType,
      ml_results: {
        score: assessment.mlScore,
        risk_level: assessment.riskLevel,
        recommendations: assessment.recommendations
      },
      timestamp: assessment.timestamp,
      user_context: assessment.userContext
    });
    
  } catch (error) {
    console.error('Error retrieving assessment:', error);
    res.status(500).json({
      error: 'Internal server error retrieving assessment'
    });
  }
});

// Admin endpoint to get all assessments
app.get('/admin/assessments', async (req, res) => {
  try {
    const assessments = await UserAssessment.find({})
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(100); // Limit to last 100 assessments for performance
    
    const formattedAssessments = assessments.map(assessment => ({
      userId: assessment.userId,
      assessmentType: assessment.assessmentType,
      mlScore: assessment.mlScore,
      riskLevel: assessment.riskLevel,
      timestamp: assessment.timestamp,
      userContext: assessment.userContext,
      responses: assessment.responses,
      recommendations: assessment.recommendations
    }));
    
    res.json({
      total: formattedAssessments.length,
      assessments: formattedAssessments
    });
    
  } catch (error) {
    console.error('Error retrieving all assessments:', error);
    res.status(500).json({
      error: 'Internal server error retrieving assessments'
    });
  }
});

// Admin stats endpoint
app.get('/admin/stats', async (req, res) => {
  try {
    const totalAssessments = await UserAssessment.countDocuments();
    const riskLevelStats = await UserAssessment.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const assessmentTypeStats = await UserAssessment.aggregate([
      {
        $group: {
          _id: '$assessmentType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalAssessments,
      riskLevelDistribution: riskLevelStats,
      assessmentTypeDistribution: assessmentTypeStats
    });
    
  } catch (error) {
    console.error('Error retrieving admin stats:', error);
    res.status(500).json({
      error: 'Internal server error retrieving stats'
    });
  }
});

// ML Model status endpoint
app.get('/model/status', (req, res) => {
  res.json({
    status: mlModel.isReady() ? 'ready' : 'initializing',
    model_info: mlModel.getModelSummary(),
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    ml_model_ready: mlModel.isReady(),
    timestamp: new Date().toISOString() 
  });
});

// Chat API endpoints

// Create a new chat room (patient requests chat)
app.post('/chat/room', async (req, res) => {
  try {
    const { patientId, patientName, assessmentData, priority = 'medium' } = req.body;
    
    // Check if patient already has an active room
    const existingRoom = await ChatRoom.findOne({ 
      patientId: patientId, 
      status: { $in: ['waiting', 'active'] } 
    });
    
    if (existingRoom) {
      return res.json({
        roomId: existingRoom.roomId,
        status: existingRoom.status,
        message: 'Existing chat room found'
      });
    }
    
    const roomId = uuidv4();
    const chatRoom = new ChatRoom({
      roomId,
      patientId,
      patientName,
      priority,
      assessmentData
    });
    
    await chatRoom.save();
    
    // Notify available doctors about new chat request
    io.emit('new_chat_request', {
      roomId,
      patientName,
      priority,
      createdAt: chatRoom.createdAt
    });
    
    res.json({
      roomId,
      status: 'waiting',
      message: 'Chat room created successfully'
    });
    
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Get chat room details
app.get('/chat/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

// Get chat messages for a room
app.get('/chat/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatMessage.find({ roomId })
      .sort({ timestamp: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get waiting chat rooms for doctors
app.get('/chat/waiting-rooms', async (req, res) => {
  try {
    const waitingRooms = await ChatRoom.find({ status: 'waiting' })
      .sort({ priority: -1, createdAt: 1 });
    
    res.json(waitingRooms);
  } catch (error) {
    console.error('Error fetching waiting rooms:', error);
    res.status(500).json({ error: 'Failed to fetch waiting rooms' });
  }
});

// Doctor accepts a chat room
app.post('/chat/accept/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { doctorId, doctorName } = req.body;
    
    const room = await ChatRoom.findOneAndUpdate(
      { roomId, status: 'waiting' },
      { 
        doctorId, 
        doctorName, 
        status: 'active',
        lastActivity: new Date()
      },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found or already taken' });
    }
    
    // Notify the patient that doctor joined
    io.to(roomId).emit('doctor_joined', {
      doctorName,
      message: `Dr. ${doctorName} has joined the chat`
    });
    
    res.json({ message: 'Chat room accepted successfully', room });
  } catch (error) {
    console.error('Error accepting chat room:', error);
    res.status(500).json({ error: 'Failed to accept chat room' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a chat room
  socket.on('join_room', async (data) => {
    const { roomId, userId, userType, userName } = data;
    
    try {
      // Verify room exists
      const room = await ChatRoom.findOne({ roomId });
      if (!room) {
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }
      
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.userType = userType;
      socket.userName = userName;
      
      console.log(`${userName} (${userType}) joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId,
        userName,
        userType,
        message: `${userName} joined the chat`
      });
      
      // Send recent messages to the newly joined user
      const recentMessages = await ChatMessage.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .sort({ timestamp: 1 });
      
      socket.emit('message_history', recentMessages);
      
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    const { roomId, message } = data;
    const { userId, userType, userName } = socket;
    
    if (!roomId || !message || !userId) {
      socket.emit('error', { message: 'Missing required data' });
      return;
    }
    
    try {
      // Save message to database
      const chatMessage = new ChatMessage({
        roomId,
        senderId: userId,
        senderName: userName,
        senderType: userType,
        message: message.trim()
      });
      
      await chatMessage.save();
      
      // Update room last activity
      await ChatRoom.findOneAndUpdate(
        { roomId },
        { lastActivity: new Date() }
      );
      
      // Broadcast message to all users in the room
      io.to(roomId).emit('new_message', {
        _id: chatMessage._id,
        roomId,
        senderId: userId,
        senderName: userName,
        senderType: userType,
        message: message.trim(),
        timestamp: chatMessage.timestamp
      });
      
      console.log(`Message sent in room ${roomId} by ${userName}: ${message}`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    const { userName, userType } = socket;
    
    socket.to(roomId).emit('user_typing', {
      userName,
      userType,
      isTyping
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId && socket.userName) {
      socket.to(socket.roomId).emit('user_left', {
        userName: socket.userName,
        userType: socket.userType,
        message: `${socket.userName} left the chat`
      });
    }
  });
  
  // Handle ending chat session
  socket.on('end_chat', async (data) => {
    const { roomId } = data;
    
    try {
      await ChatRoom.findOneAndUpdate(
        { roomId },
        { 
          status: 'completed',
          lastActivity: new Date()
        }
      );
      
      // Notify all users in the room
      io.to(roomId).emit('chat_ended', {
        message: 'Chat session has been ended'
      });
      
      console.log(`Chat session ended for room ${roomId}`);
      
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`CustomML Backend Server with Socket.IO running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`CustomML endpoint: http://localhost:${PORT}/customML`);
  console.log(`Socket.IO chat enabled`);
});
