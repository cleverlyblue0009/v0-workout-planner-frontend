const express = require('express');
const {
  generateWorkoutPlan,
  generateNutritionPlan,
  analyzeProgress,
  getRecommendations,
  regenerateWorkoutPlan
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { validateWorkoutPlan, validateNutritionPlan } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// AI Plan Generation
router.post('/generate-workout', validateWorkoutPlan, generateWorkoutPlan);
router.post('/generate-nutrition', validateNutritionPlan, generateNutritionPlan);
router.post('/regenerate-workout', regenerateWorkoutPlan);

// AI Analysis and Recommendations
router.get('/analyze-progress', analyzeProgress);
router.get('/recommendations', getRecommendations);

module.exports = router;