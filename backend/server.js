const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const UserAssessment = require('./models/UserAssessment');
const CustomMLModel = require('./ml/simplifiedMLModel');

console.log('Using Advanced Statistical ML Model (TensorFlow.js-compatible)');

const app = express();
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

// Start server
app.listen(PORT, () => {
  console.log(`CustomML Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`CustomML endpoint: http://localhost:${PORT}/customML`);
});
