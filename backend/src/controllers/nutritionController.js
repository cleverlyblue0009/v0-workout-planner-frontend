const { FoodItem, NutritionPlan, NutritionLog } = require('../models/Nutrition');
const User = require('../models/User');

// @desc    Search food items
// @route   GET /api/nutrition/foods/search
// @access  Private
const searchFoods = async (req, res) => {
  try {
    const { q, category, dietary, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const query = {
      $text: { $search: q }
    };

    if (category) query.category = category;
    if (dietary) query.dietaryFlags = { $in: dietary.split(',') };

    const foods = await FoodItem.find(query)
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' } });

    res.json({
      success: true,
      data: { foods }
    });
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching foods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get food item by barcode
// @route   GET /api/nutrition/foods/barcode/:barcode
// @access  Private
const getFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const food = await FoodItem.findOne({ barcode });
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found for this barcode'
      });
    }

    res.json({
      success: true,
      data: { food }
    });
  } catch (error) {
    console.error('Get food by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting food by barcode',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nutrition plans
// @route   GET /api/nutrition/plans
// @access  Private
const getNutritionPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, goal } = req.query;
    
    const query = { 
      userId: req.user.id, 
      isActive: true 
    };
    
    if (goal) query.goal = goal;

    const plans = await NutritionPlan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NutritionPlan.countDocuments(query);

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
    console.error('Get nutrition plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting nutrition plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single nutrition plan
// @route   GET /api/nutrition/plans/:id
// @access  Private
const getNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition plan not found'
      });
    }

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting nutrition plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create nutrition plan
// @route   POST /api/nutrition/plans
// @access  Private
const createNutritionPlan = async (req, res) => {
  try {
    const planData = {
      ...req.body,
      userId: req.user.id
    };

    const plan = await NutritionPlan.create(planData);

    res.status(201).json({
      success: true,
      message: 'Nutrition plan created successfully',
      data: { plan }
    });
  } catch (error) {
    console.error('Create nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating nutrition plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nutrition log for date
// @route   GET /api/nutrition/log
// @access  Private
const getNutritionLog = async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let log = await NutritionLog.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!log) {
      // Create empty log for the day
      log = await NutritionLog.create({
        userId: req.user.id,
        date: startOfDay,
        meals: [],
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      });
    }

    // Get user's nutrition goals
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        log,
        goals: user.nutritionGoals
      }
    });
  } catch (error) {
    console.error('Get nutrition log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting nutrition log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add food to nutrition log
// @route   POST /api/nutrition/log/food
// @access  Private
const addFoodToLog = async (req, res) => {
  try {
    const { date, mealType, foodId, name, quantity, nutrition } = req.body;
    
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);
    
    let log = await NutritionLog.findOne({
      userId: req.user.id,
      date: logDate
    });

    if (!log) {
      log = await NutritionLog.create({
        userId: req.user.id,
        date: logDate,
        meals: [],
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      });
    }

    // Find or create meal
    let meal = log.meals.find(m => m.mealType === mealType);
    if (!meal) {
      meal = {
        mealType,
        time: new Date(),
        foods: [],
        totalNutrition: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      };
      log.meals.push(meal);
    }

    // Add food to meal
    meal.foods.push({
      foodId,
      name,
      quantity,
      nutrition
    });

    // Recalculate meal totals
    meal.totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    meal.foods.forEach(food => {
      if (food.nutrition) {
        Object.keys(meal.totalNutrition).forEach(nutrient => {
          meal.totalNutrition[nutrient] += food.nutrition[nutrient] || 0;
        });
      }
    });

    // Recalculate daily totals
    log.calculateDailyTotals();
    
    await log.save();

    res.json({
      success: true,
      message: 'Food added to log successfully',
      data: { log }
    });
  } catch (error) {
    console.error('Add food to log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding food to log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update water intake
// @route   PUT /api/nutrition/log/water
// @access  Private
const updateWaterIntake = async (req, res) => {
  try {
    const { date, amount } = req.body;
    
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);
    
    let log = await NutritionLog.findOne({
      userId: req.user.id,
      date: logDate
    });

    if (!log) {
      log = await NutritionLog.create({
        userId: req.user.id,
        date: logDate,
        meals: [],
        waterIntake: amount
      });
    } else {
      log.waterIntake = amount;
      await log.save();
    }

    res.json({
      success: true,
      message: 'Water intake updated successfully',
      data: { log }
    });
  } catch (error) {
    console.error('Update water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating water intake',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nutrition statistics
// @route   GET /api/nutrition/stats
// @access  Private
const getNutritionStats = async (req, res) => {
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
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Overall stats
    const overallStats = await NutritionLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          avgCalories: { $avg: '$dailyTotals.calories' },
          avgProtein: { $avg: '$dailyTotals.protein' },
          avgCarbs: { $avg: '$dailyTotals.carbohydrates' },
          avgFat: { $avg: '$dailyTotals.fat' },
          avgWater: { $avg: '$waterIntake' }
        }
      }
    ]);

    // Daily breakdown
    const dailyStats = await NutritionLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          calories: '$dailyTotals.calories',
          protein: '$dailyTotals.protein',
          carbohydrates: '$dailyTotals.carbohydrates',
          fat: '$dailyTotals.fat',
          water: '$waterIntake'
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get user goals for comparison
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        period,
        overall: overallStats[0] || {
          totalDays: 0,
          avgCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFat: 0,
          avgWater: 0
        },
        daily: dailyStats,
        goals: user.nutritionGoals
      }
    });
  } catch (error) {
    console.error('Get nutrition stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting nutrition statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get meal suggestions
// @route   GET /api/nutrition/suggestions
// @access  Private
const getMealSuggestions = async (req, res) => {
  try {
    const { mealType, targetCalories, dietaryRestrictions } = req.query;
    
    // This is a simplified version - in a real app, you'd have a more sophisticated
    // recommendation engine, possibly using AI or a comprehensive meal database
    
    const query = {};
    if (dietaryRestrictions) {
      query.dietaryFlags = { $in: dietaryRestrictions.split(',') };
    }

    // Get some sample meals (in a real app, this would be more intelligent)
    const suggestions = await FoodItem.aggregate([
      { $match: query },
      { $sample: { size: 10 } },
      {
        $project: {
          name: 1,
          category: 1,
          nutrition: 1,
          dietaryFlags: 1,
          servingSize: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get meal suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting meal suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
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
};