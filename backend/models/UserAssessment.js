const mongoose = require('mongoose');

const userAssessmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  assessmentType: {
    type: String,
    required: true,
    enum: ['CustomML', 'PHQ9', 'GAD7', 'PSS10']
  },
  responses: [{
    type: Number,
    required: true
  }],
  userContext: {
    age_group: {
      type: String,
      required: true
    },
    institution_type: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    previous_mental_health_treatment: {
      type: Boolean,
      required: true
    }
  },
  mlScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'severe'],
    required: true
  },
  recommendations: [{
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserAssessment', userAssessmentSchema);
