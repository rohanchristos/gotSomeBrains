const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const UserAssessment = require('./models/UserAssessment');
const ChatMessage = require('./models/ChatMessage');
const ChatRoom = require('./models/ChatRoom');
const CustomMLModel = require('./ml/customMLModel');
const {
  validateAssessment,
  validateChatRoom,
  validateChatAccept,
  validateUserId,
  validateRoomId
} = require('./middleware/validation');

console.log('Using TensorFlow.js Neural Network ML Model');

const app = express();
const server = http.createServer(app);

// Environment variables with validation
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health_app';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize ML Model
const mlModel = new CustomMLModel();

// MongoDB Connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('Failed to connect to MongoDB after multiple attempts');
        if (NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  }
};

connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const corsOptions = {
  origin: CORS_ORIGIN.split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Socket.IO with CORS
const io = socketIo(server, {
  cors: corsOptions
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/customML', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // More restrictive for ML endpoint
  message: 'Too many assessment submissions, please try again later.'
}));

app.use('/admin', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // More restrictive for admin endpoints
  message: 'Too many admin requests, please try again later.'
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Request logging middleware (production-ready)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (NODE_ENV === 'development' || res.statusCode >= 400) {
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Custom ML endpoint with validation
app.post('/customML', validateAssessment, async (req, res) => {
  try {
    const { assessment_type, responses, user_context, timestamp } = req.body;
    
    // Generate unique user ID
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
    
    console.log(`✅ Assessment saved: ${userId} (${assessment_type})`);
    
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
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error processing assessment:', error.message);
    res.status(500).json({
      error: 'Internal server error processing assessment',
      details: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user assessment results
app.get('/assessment/:userId', validateUserId, async (req, res) => {
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
    console.error('❌ Error retrieving assessment:', error.message);
    res.status(500).json({
      error: 'Internal server error retrieving assessment'
    });
  }
});

// Admin endpoint to get all assessments
app.get('/admin/assessments', limiter, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = parseInt(req.query.skip) || 0;
    
    const assessments = await UserAssessment.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await UserAssessment.countDocuments();
    
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
      total: total,
      count: formattedAssessments.length,
      assessments: formattedAssessments
    });
    
  } catch (error) {
    console.error('❌ Error retrieving assessments:', error.message);
    res.status(500).json({
      error: 'Internal server error retrieving assessments'
    });
  }
});

// Admin stats endpoint
app.get('/admin/stats', limiter, async (req, res) => {
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
    console.error('❌ Error retrieving stats:', error.message);
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

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    ml_model_ready: mlModel.isReady(),
    database: 'disconnected',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };
  
  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.database = 'connected';
    }
  } catch (error) {
    health.database = 'error';
    health.status = 'DEGRADED';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Chat API endpoints
app.post('/chat/room', validateChatRoom, async (req, res) => {
  try {
    const { patientId, patientName, assessmentData, priority = 'medium' } = req.body;
    
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
    console.error('❌ Error creating chat room:', error.message);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

app.get('/chat/room/:roomId', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('❌ Error fetching chat room:', error.message);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

app.get('/chat/messages/:roomId', validateRoomId, async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    
    const messages = await ChatMessage.find({ roomId })
      .sort({ timestamp: 1 })
      .limit(limit);
    
    res.json(messages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/chat/waiting-rooms', async (req, res) => {
  try {
    const waitingRooms = await ChatRoom.find({ status: 'waiting' })
      .sort({ priority: -1, createdAt: 1 });
    
    res.json(waitingRooms);
  } catch (error) {
    console.error('❌ Error fetching waiting rooms:', error.message);
    res.status(500).json({ error: 'Failed to fetch waiting rooms' });
  }
});

app.post('/chat/accept/:roomId', validateChatAccept, async (req, res) => {
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
    
    io.to(roomId).emit('doctor_joined', {
      doctorName,
      message: `Dr. ${doctorName} has joined the chat`
    });
    
    res.json({ message: 'Chat room accepted successfully', room });
  } catch (error) {
    console.error('❌ Error accepting chat room:', error.message);
    res.status(500).json({ error: 'Failed to accept chat room' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  socket.on('join_room', async (data) => {
    const { roomId, userId, userType, userName } = data;
    
    try {
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
      
      socket.to(roomId).emit('user_joined', {
        userId,
        userName,
        userType,
        message: `${userName} joined the chat`
      });
      
      const recentMessages = await ChatMessage.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .sort({ timestamp: 1 });
      
      socket.emit('message_history', recentMessages);
      
    } catch (error) {
      console.error('❌ Error joining room:', error.message);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  socket.on('send_message', async (data) => {
    const { roomId, message } = data;
    const { userId, userType, userName } = socket;
    
    if (!roomId || !message || !userId) {
      socket.emit('error', { message: 'Missing required data' });
      return;
    }
    
    // Sanitize message
    const sanitizedMessage = message.trim().substring(0, 1000);
    
    try {
      const chatMessage = new ChatMessage({
        roomId,
        senderId: userId,
        senderName: userName,
        senderType: userType,
        message: sanitizedMessage
      });
      
      await chatMessage.save();
      
      await ChatRoom.findOneAndUpdate(
        { roomId },
        { lastActivity: new Date() }
      );
      
      io.to(roomId).emit('new_message', {
        _id: chatMessage._id,
        roomId,
        senderId: userId,
        senderName: userName,
        senderType: userType,
        message: sanitizedMessage,
        timestamp: chatMessage.timestamp
      });
      
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    const { userName, userType } = socket;
    
    socket.to(roomId).emit('user_typing', {
      userName,
      userType,
      isTyping
    });
  });
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
    
    if (socket.roomId && socket.userName) {
      socket.to(socket.roomId).emit('user_left', {
        userName: socket.userName,
        userType: socket.userType,
        message: `${socket.userName} left the chat`
      });
    }
  });
  
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
      
      io.to(roomId).emit('chat_ended', {
        message: 'Chat session has been ended'
      });
      
    } catch (error) {
      console.error('❌ Error ending chat:', error.message);
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 ML endpoint: http://localhost:${PORT}/customML`);
  console.log(`💬 Socket.IO chat enabled`);
});
