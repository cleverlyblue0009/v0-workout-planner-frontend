const express = require('express');
const {
  searchFoods,
  getFoodByBarcode,
  getNutritionPlans,
  getNutritionPlan,
  createNutritionPlan,
  getNutritionLog,
  addFoodToLog,
  updateWaterIntake,
  getNutritionStats,
  getMealSuggestions
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');
const { validateNutritionPlan } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Food search and lookup
router.get('/foods/search', searchFoods);
router.get('/foods/barcode/:barcode', getFoodByBarcode);

// Nutrition Plans
router.route('/plans')
  .get(getNutritionPlans)
  .post(validateNutritionPlan, createNutritionPlan);

router.route('/plans/:id')
  .get(getNutritionPlan);

// Nutrition Logging
router.route('/log')
  .get(getNutritionLog);

router.post('/log/food', addFoodToLog);
router.put('/log/water', updateWaterIntake);

// Statistics and suggestions
router.get('/stats', getNutritionStats);
router.get('/suggestions', getMealSuggestions);

module.exports = router;