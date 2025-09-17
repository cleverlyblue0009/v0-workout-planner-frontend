const { WorkoutPlan, WorkoutSession } = require('../models/Workout');
const User = require('../models/User');

// @desc    Get all workout plans for user
// @route   GET /api/workouts/plans
// @access  Private
const getWorkoutPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, goal, difficulty, equipment } = req.query;
    
    const query = { 
      userId: req.user.id, 
      isActive: true 
    };
    
    // Add filters
    if (goal) query.goal = goal;
    if (difficulty) query.difficulty = difficulty;
    if (equipment) query.equipment = equipment;

    const plans = await WorkoutPlan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkoutPlan.countDocuments(query);

    res.json({
      success: true,
      data: {
        plans,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting workout plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single workout plan
// @route   GET /api/workouts/plans/:id
// @access  Private
const getWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Get plan statistics
    const stats = await plan.getStats();

    res.json({
      success: true,
      data: {
        plan,
        stats
      }
    });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create workout plan
// @route   POST /api/workouts/plans
// @access  Private
const createWorkoutPlan = async (req, res) => {
  try {
    const planData = {
      ...req.body,
      userId: req.user.id
    };

    const plan = await WorkoutPlan.create(planData);

    res.status(201).json({
      success: true,
      message: 'Workout plan created successfully',
      data: { plan }
    });
  } catch (error) {
    console.error('Create workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update workout plan
// @route   PUT /api/workouts/plans/:id
// @access  Private
const updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    Object.assign(plan, req.body);
    await plan.save();

    res.json({
      success: true,
      message: 'Workout plan updated successfully',
      data: { plan }
    });
  } catch (error) {
    console.error('Update workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete workout plan
// @route   DELETE /api/workouts/plans/:id
// @access  Private
const deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Soft delete
    plan.isActive = false;
    await plan.save();

    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Start workout session
// @route   POST /api/workouts/sessions
// @access  Private
const startWorkoutSession = async (req, res) => {
  try {
    const { workoutPlanId, name } = req.body;

    // Verify workout plan exists and belongs to user
    const plan = await WorkoutPlan.findOne({
      _id: workoutPlanId,
      userId: req.user.id,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Check if there's already an active session
    const activeSession = await WorkoutSession.findOne({
      userId: req.user.id,
      completed: false
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active workout session. Please complete or cancel it first.',
        data: { activeSession }
      });
    }

    // Create new session
    const session = await WorkoutSession.create({
      userId: req.user.id,
      workoutPlanId,
      name: name || plan.name,
      startTime: new Date(),
      exercises: plan.exercises.map(exercise => ({
        exerciseId: exercise._id,
        name: exercise.name,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          setNumber: i + 1,
          reps: exercise.reps?.target || 0,
          weight: exercise.weight || 0,
          duration: exercise.duration || 0,
          distance: exercise.distance || 0,
          restTime: exercise.restTime || 60,
          completed: false
        })),
        completed: false,
        skipped: false
      }))
    });

    res.status(201).json({
      success: true,
      message: 'Workout session started successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Start workout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting workout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get active workout session
// @route   GET /api/workouts/sessions/active
// @access  Private
const getActiveSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      userId: req.user.id,
      completed: false
    }).populate('workoutPlanId', 'name description goal difficulty');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active workout session found'
      });
    }

    // Calculate progress
    const progress = session.calculateProgress();

    res.json({
      success: true,
      data: {
        session,
        progress
      }
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting active session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update workout session
// @route   PUT /api/workouts/sessions/:id
// @access  Private
const updateWorkoutSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found'
      });
    }

    // Update session data
    Object.assign(session, req.body);
    
    // Calculate total calories burned if exercises are updated
    if (req.body.exercises) {
      let totalCalories = 0;
      session.exercises.forEach(exercise => {
        if (exercise.completed) {
          // Simple calorie calculation - can be made more sophisticated
          const completedSets = exercise.sets.filter(set => set.completed).length;
          totalCalories += completedSets * 15; // Rough estimate: 15 calories per set
        }
      });
      session.totalCaloriesBurned = totalCalories;
    }

    await session.save();

    res.json({
      success: true,
      message: 'Workout session updated successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Update workout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating workout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Complete workout session
// @route   POST /api/workouts/sessions/:id/complete
// @access  Private
const completeWorkoutSession = async (req, res) => {
  try {
    const { rating, notes, mood } = req.body;

    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      completed: false
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active workout session not found'
      });
    }

    // Calculate session duration
    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60)); // in minutes

    // Update session
    session.endTime = endTime;
    session.duration = duration;
    session.completed = true;
    session.rating = rating;
    session.notes = notes;
    if (mood) session.mood.after = mood;

    // Calculate calories burned
    let totalCalories = 0;
    session.exercises.forEach(exercise => {
      if (exercise.completed) {
        const completedSets = exercise.sets.filter(set => set.completed).length;
        totalCalories += completedSets * 15; // Rough estimate
      }
    });
    session.totalCaloriesBurned = totalCalories;

    await session.save();

    // Update user streak
    const user = await User.findById(req.user.id);
    user.updateStreak();
    await user.save();

    res.json({
      success: true,
      message: 'Workout session completed successfully',
      data: {
        session,
        caloriesBurned: totalCalories,
        duration,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Complete workout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing workout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get workout history
// @route   GET /api/workouts/sessions
// @access  Private
const getWorkoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const query = { 
      userId: req.user.id, 
      completed: true 
    };

    // Add date range filter
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const sessions = await WorkoutSession.find(query)
      .populate('workoutPlanId', 'name goal difficulty')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkoutSession.countDocuments(query);

    // Calculate summary stats
    const stats = await WorkoutSession.aggregate([
      { $match: { ...query } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        stats: stats[0] || {
          totalSessions: 0,
          totalDuration: 0,
          totalCalories: 0,
          avgRating: 0
        }
      }
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting workout history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
const getWorkoutStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Overall stats
    const overallStats = await WorkoutSession.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          avgRating: { $avg: '$rating' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Daily breakdown
    const dailyStats = await WorkoutSession.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          sessions: { $sum: 1 },
          duration: { $sum: '$duration' },
          calories: { $sum: '$totalCaloriesBurned' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Workout type distribution
    const typeStats = await WorkoutSession.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          startTime: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'workoutplans',
          localField: 'workoutPlanId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: '$plan.workoutType',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        overall: overallStats[0] || {
          totalSessions: 0,
          totalDuration: 0,
          totalCalories: 0,
          avgRating: 0,
          avgDuration: 0
        },
        daily: dailyStats,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting workout statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
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
};