const AIService = require('../services/aiService');
const LocationService = require('../services/locationService');
const { WorkoutPlan, WorkoutSession } = require('../models/Workout');
const { NutritionPlan, NutritionLog } = require('../models/Nutrition');
const User = require('../models/User');

// @desc    Generate AI workout plan
// @route   POST /api/ai/generate-workout
// @access  Private
const generateWorkoutPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = req.body;

    // Combine user profile with request preferences
    const userProfile = {
      ...user.profile.toObject(),
      ...preferences
    };

    // Generate AI workout plan
    const aiPlan = await AIService.generateWorkoutPlan(userProfile, preferences);

    // Create workout plan in database
    const workoutPlan = await WorkoutPlan.create({
      userId: req.user.id,
      name: aiPlan.name || 'AI Generated Workout Plan',
      description: aiPlan.description || 'Personalized workout plan created by AI',
      goal: preferences.goal || userProfile.fitnessGoal || 'general-fitness',
      difficulty: preferences.experience || 'intermediate',
      duration: aiPlan.duration || 45,
      equipment: preferences.equipment || 'bodyweight',
      workoutType: preferences.workoutStyle || 'mixed',
      exercises: aiPlan.exercises || [],
      schedule: aiPlan.schedule || {
        daysPerWeek: 3,
        programLength: 12
      },
      estimatedCaloriesBurn: aiPlan.estimatedCaloriesBurn || 300,
      isAIGenerated: true,
      aiPrompt: JSON.stringify(preferences)
    });

    res.status(201).json({
      success: true,
      message: 'AI workout plan generated successfully',
      data: { workoutPlan }
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Generate AI nutrition plan
// @route   POST /api/ai/generate-nutrition
// @access  Private
const generateNutritionPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = req.body;

    // Handle location data if provided
    let locationData = null;
    if (preferences.location && preferences.location.latitude && preferences.location.longitude) {
      // Get detailed location information from coordinates
      const detailedLocation = await LocationService.getLocationFromCoordinates(
        preferences.location.latitude,
        preferences.location.longitude
      );
      
      if (detailedLocation) {
        locationData = detailedLocation;
        
        // Update user's location with detailed information
        user.location = detailedLocation;
        await user.save();
      } else {
        // Fallback to basic coordinates
        locationData = preferences.location;
      }
    } else if (user.location) {
      locationData = user.location;
    }

    // Ensure user has nutrition goals set
    let nutritionGoals = user.nutritionGoals;
    if (!nutritionGoals.targetCalories) {
      // Calculate basic nutrition goals based on user profile
      const bmr = user.calculateBMR();
      const tdee = user.calculateTDEE();
      
      if (tdee) {
        // Set default goals based on fitness goal
        let calorieAdjustment = 0;
        switch (user.profile.fitnessGoal) {
          case 'weight-loss':
            calorieAdjustment = -500; // 500 calorie deficit
            break;
          case 'weight-gain':
          case 'muscle-gain':
            calorieAdjustment = 300; // 300 calorie surplus
            break;
          default:
            calorieAdjustment = 0; // maintenance
        }
        
        nutritionGoals = {
          targetCalories: Math.max(1200, tdee + calorieAdjustment),
          macroRatios: {
            protein: 25,
            carbs: 45,
            fats: 30
          }
        };
        
        // Update user's nutrition goals
        user.nutritionGoals = nutritionGoals;
        await user.save();
      } else {
        // Fallback defaults
        nutritionGoals = {
          targetCalories: 2000,
          macroRatios: {
            protein: 25,
            carbs: 45,
            fats: 30
          }
        };
      }
    }

    // Get workout goals if requested
    let workoutGoals = null;
    if (preferences.workoutGoals || preferences.includeWorkoutNutrition) {
      if (preferences.workoutGoals) {
        workoutGoals = preferences.workoutGoals;
      } else {
        // Try to get the latest workout plan
        try {
          const { WorkoutPlan } = require('../models/Workout');
          const latestWorkoutPlan = await WorkoutPlan.findOne({
            userId: req.user.id,
            isActive: true
          }).sort({ createdAt: -1 });
          
          if (latestWorkoutPlan) {
            workoutGoals = {
              goal: latestWorkoutPlan.goal,
              difficulty: latestWorkoutPlan.difficulty,
              duration: latestWorkoutPlan.duration,
              workoutType: latestWorkoutPlan.workoutType,
              estimatedCaloriesBurn: latestWorkoutPlan.estimatedCaloriesBurn
            };
          }
        } catch (error) {
          console.log('No workout plan found, using profile goals');
        }
      }
    }

    // Generate AI nutrition plan
    const aiPlan = await AIService.generateNutritionPlan(
      user.profile.toObject(),
      { ...user.preferences.toObject(), ...preferences },
      nutritionGoals,
      locationData,
      workoutGoals
    );

    // Create nutrition plan in database
    const nutritionPlan = await NutritionPlan.create({
      userId: req.user.id,
      name: aiPlan.name || 'AI Generated Nutrition Plan',
      description: aiPlan.description || 'Personalized nutrition plan created by AI',
      goal: preferences.goal || user.profile.fitnessGoal || 'maintenance',
      targetCalories: nutritionGoals.targetCalories,
      macroTargets: aiPlan.macroTargets || {
        protein: { 
          grams: Math.round((nutritionGoals.targetCalories * nutritionGoals.macroRatios.protein / 100) / 4),
          percentage: nutritionGoals.macroRatios.protein
        },
        carbohydrates: { 
          grams: Math.round((nutritionGoals.targetCalories * nutritionGoals.macroRatios.carbs / 100) / 4),
          percentage: nutritionGoals.macroRatios.carbs
        },
        fat: { 
          grams: Math.round((nutritionGoals.targetCalories * nutritionGoals.macroRatios.fats / 100) / 9),
          percentage: nutritionGoals.macroRatios.fats
        }
      },
      meals: aiPlan.meals || [],
      schedule: aiPlan.schedule || {
        mealsPerDay: 3,
        mealTiming: []
      },
      dietaryRestrictions: user.preferences.dietaryRestrictions || [],
      allergies: user.preferences.allergies || [],
      waterIntakeTarget: aiPlan.waterIntakeTarget || 2.5,
      isAIGenerated: true,
      aiPrompt: JSON.stringify(preferences)
    });

    res.status(201).json({
      success: true,
      message: 'AI nutrition plan generated successfully',
      data: { nutritionPlan }
    });
  } catch (error) {
    console.error('Generate nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating nutrition plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get AI progress analysis
// @route   GET /api/ai/analyze-progress
// @access  Private
const analyzeProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get recent workout history
    const workoutHistory = await WorkoutSession.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          totalCalories: { $sum: '$totalCaloriesBurned' },
          consistency: { $avg: { $cond: [{ $eq: ['$completed', true] }, 100, 0] } }
        }
      }
    ]);

    // Get recent nutrition history
    const nutritionHistory = await NutritionLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: '$dailyTotals.calories' },
          avgProtein: { $avg: '$dailyTotals.protein' },
          adherenceScore: { $avg: '$adherenceScore' }
        }
      }
    ]);

    // Mock progress data (in a real app, this would come from progress tracking)
    const progressData = {
      startingWeight: user.profile.weight,
      currentWeight: user.profile.weight, // Would be updated from recent measurements
      weightChange: 0,
      bodyFatChange: 0,
      strengthGains: 'moderate'
    };

    // Generate AI analysis
    const analysis = await AIService.analyzeProgress(
      user.profile.toObject(),
      workoutHistory[0] || {},
      nutritionHistory[0] || {},
      progressData
    );

    res.json({
      success: true,
      data: {
        analysis,
        workoutSummary: workoutHistory[0] || {},
        nutritionSummary: nutritionHistory[0] || {},
        progressData
      }
    });
  } catch (error) {
    console.error('Analyze progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error analyzing progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get AI recommendations
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get current active plans
    const currentWorkoutPlan = await WorkoutPlan.findOne({
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    // Get recent activity summary
    const recentActivity = await WorkoutSession.countDocuments({
      userId: req.user.id,
      completed: true,
      startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const recommendations = await AIService.getRecommendations(
      user.profile.toObject(),
      currentWorkoutPlan,
      `${recentActivity} workouts completed in the last 7 days`
    );

    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Regenerate plan with feedback
// @route   POST /api/ai/regenerate-workout
// @access  Private
const regenerateWorkoutPlan = async (req, res) => {
  try {
    const { planId, feedback, adjustments } = req.body;
    
    // Get original plan
    const originalPlan = await WorkoutPlan.findOne({
      _id: planId,
      userId: req.user.id
    });

    if (!originalPlan) {
      return res.status(404).json({
        success: false,
        message: 'Original workout plan not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Combine original preferences with feedback and adjustments
    const originalPreferences = JSON.parse(originalPlan.aiPrompt || '{}');
    const updatedPreferences = {
      ...originalPreferences,
      ...adjustments,
      feedback
    };

    // Generate new AI plan
    const aiPlan = await AIService.generateWorkoutPlan(
      user.profile.toObject(),
      updatedPreferences
    );

    // Create new workout plan
    const newWorkoutPlan = await WorkoutPlan.create({
      userId: req.user.id,
      name: aiPlan.name || `${originalPlan.name} (Revised)`,
      description: aiPlan.description || 'Revised workout plan based on feedback',
      goal: originalPlan.goal,
      difficulty: originalPlan.difficulty,
      duration: aiPlan.duration || originalPlan.duration,
      equipment: originalPlan.equipment,
      workoutType: originalPlan.workoutType,
      exercises: aiPlan.exercises || originalPlan.exercises,
      schedule: aiPlan.schedule || originalPlan.schedule,
      estimatedCaloriesBurn: aiPlan.estimatedCaloriesBurn || originalPlan.estimatedCaloriesBurn,
      isAIGenerated: true,
      aiPrompt: JSON.stringify(updatedPreferences)
    });

    // Deactivate old plan
    originalPlan.isActive = false;
    await originalPlan.save();

    res.status(201).json({
      success: true,
      message: 'Workout plan regenerated successfully',
      data: { workoutPlan: newWorkoutPlan }
    });
  } catch (error) {
    console.error('Regenerate workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error regenerating workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  generateWorkoutPlan,
  generateNutritionPlan,
  analyzeProgress,
  getRecommendations,
  regenerateWorkoutPlan
};