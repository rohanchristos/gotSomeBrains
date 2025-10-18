const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Assessment validation rules
const validateAssessment = [
  body('assessment_type')
    .isIn(['CustomML', 'PHQ9', 'GAD7', 'PSS10'])
    .withMessage('Invalid assessment type'),
  body('responses')
    .isArray({ min: 1, max: 20 })
    .withMessage('Responses must be an array with 1-20 items'),
  body('responses.*')
    .isInt({ min: 0, max: 10 })
    .withMessage('Each response must be an integer between 0 and 10'),
  body('user_context')
    .isObject()
    .withMessage('User context must be an object'),
  body('user_context.age_group')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Age group is required'),
  body('user_context.institution_type')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Institution type is required'),
  body('user_context.gender')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Gender is required'),
  body('user_context.previous_mental_health_treatment')
    .isBoolean()
    .withMessage('Previous treatment must be a boolean'),
  body('timestamp')
    .isISO8601()
    .withMessage('Invalid timestamp format'),
  validate
];

// Chat room validation rules
const validateChatRoom = [
  body('patientId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Patient ID is required'),
  body('patientName')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Patient name is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  validate
];

// Chat accept validation rules
const validateChatAccept = [
  param('roomId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room ID is required'),
  body('doctorId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Doctor ID is required'),
  body('doctorName')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Doctor name is required'),
  validate
];

// User ID validation
const validateUserId = [
  param('userId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID is required'),
  validate
];

// Room ID validation
const validateRoomId = [
  param('roomId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room ID is required'),
  validate
];

module.exports = {
  validateAssessment,
  validateChatRoom,
  validateChatAccept,
  validateUserId,
  validateRoomId
};
