const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 500 })
    .withMessage('Weight must be between 30 and 500 kg'),
  
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Workout plan validation
const validateWorkoutPlan = [
  body('goal')
    .isIn(['weight-loss', 'muscle-gain', 'strength', 'endurance', 'general-fitness'])
    .withMessage('Invalid goal selected'),
  
  body('experience')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid experience level'),
  
  body('equipment')
    .isIn(['full-gym', 'home-basic', 'bodyweight', 'dumbbells', 'resistance-bands'])
    .withMessage('Invalid equipment option'),
  
  body('timePerDay')
    .isIn(['15-30', '30-45', '45-60', '60+'])
    .withMessage('Invalid time duration'),
  
  body('workoutStyle')
    .isIn(['strength-training', 'hiit', 'cardio', 'yoga-pilates', 'mixed'])
    .withMessage('Invalid workout style'),
  
  handleValidationErrors
];

// Nutrition plan validation
const validateNutritionPlan = [
  body('goal')
    .isIn(['weight-loss', 'weight-gain', 'maintenance', 'muscle-gain'])
    .withMessage('Invalid nutrition goal'),
  
  body('dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  
  body('targetCalories')
    .optional()
    .isInt({ min: 1000, max: 5000 })
    .withMessage('Target calories must be between 1000 and 5000'),
  
  handleValidationErrors
];

// Progress entry validation
const validateProgressEntry = [
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 500 })
    .withMessage('Weight must be between 30 and 500 kg'),
  
  body('bodyFatPercentage')
    .optional()
    .isFloat({ min: 3, max: 50 })
    .withMessage('Body fat percentage must be between 3 and 50'),
  
  body('measurements')
    .optional()
    .isObject()
    .withMessage('Measurements must be an object'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateWorkoutPlan,
  validateNutritionPlan,
  validateProgressEntry,
  handleValidationErrors
};