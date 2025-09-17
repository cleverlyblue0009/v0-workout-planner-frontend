const express = require('express');
const {
  getWorkoutPlans,
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  startWorkoutSession,
  getActiveSession,
  updateWorkoutSession,
  completeWorkoutSession,
  getWorkoutHistory,
  getWorkoutStats
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const { validateWorkoutPlan } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Workout Plans
router.route('/plans')
  .get(getWorkoutPlans)
  .post(validateWorkoutPlan, createWorkoutPlan);

router.route('/plans/:id')
  .get(getWorkoutPlan)
  .put(updateWorkoutPlan)
  .delete(deleteWorkoutPlan);

// Workout Sessions
router.route('/sessions')
  .get(getWorkoutHistory)
  .post(startWorkoutSession);

router.get('/sessions/active', getActiveSession);

router.route('/sessions/:id')
  .put(updateWorkoutSession);

router.post('/sessions/:id/complete', completeWorkoutSession);

// Statistics
router.get('/stats', getWorkoutStats);

module.exports = router;