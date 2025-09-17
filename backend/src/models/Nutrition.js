const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  barcode: String,
  category: {
    type: String,
    enum: [
      'fruits', 'vegetables', 'grains', 'protein', 'dairy', 'nuts-seeds',
      'legumes', 'oils-fats', 'beverages', 'snacks', 'condiments', 'other'
    ],
    default: 'other'
  },
  servingSize: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Serving size cannot be negative']
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'oz'],
      required: true
    }
  },
  nutrition: {
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      required: true,
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      required: true,
      min: [0, 'Carbohydrates cannot be negative']
    },
    fat: {
      type: Number,
      required: true,
      min: [0, 'Fat cannot be negative']
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
      default: 0
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar cannot be negative'],
      default: 0
    },
    sodium: {
      type: Number, // in mg
      min: [0, 'Sodium cannot be negative'],
      default: 0
    },
    cholesterol: {
      type: Number, // in mg
      min: [0, 'Cholesterol cannot be negative'],
      default: 0
    },
    saturatedFat: {
      type: Number,
      min: [0, 'Saturated fat cannot be negative'],
      default: 0
    },
    transFat: {
      type: Number,
      min: [0, 'Trans fat cannot be negative'],
      default: 0
    }
  },
  vitamins: {
    vitaminA: Number, // in IU
    vitaminC: Number, // in mg
    vitaminD: Number, // in IU
    vitaminE: Number, // in mg
    vitaminK: Number, // in mcg
    thiamine: Number, // in mg
    riboflavin: Number, // in mg
    niacin: Number, // in mg
    vitaminB6: Number, // in mg
    folate: Number, // in mcg
    vitaminB12: Number, // in mcg
    biotin: Number, // in mcg
    pantothenicAcid: Number // in mg
  },
  minerals: {
    calcium: Number, // in mg
    iron: Number, // in mg
    magnesium: Number, // in mg
    phosphorus: Number, // in mg
    potassium: Number, // in mg
    zinc: Number, // in mg
    copper: Number, // in mg
    manganese: Number, // in mg
    selenium: Number // in mcg
  },
  allergens: [{
    type: String,
    enum: ['milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soybeans', 'sesame']
  }],
  dietaryFlags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto-friendly', 'paleo-friendly', 'halal', 'kosher']
  }],
  imageUrl: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'],
    required: true
  },
  foods: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      amount: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
      },
      unit: {
        type: String,
        required: true
      }
    },
    nutrition: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number
    }
  }],
  totalNutrition: {
    calories: {
      type: Number,
      default: 0,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      default: 0,
      min: [0, 'Carbohydrates cannot be negative']
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative']
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative']
    },
    sugar: {
      type: Number,
      default: 0,
      min: [0, 'Sugar cannot be negative']
    },
    sodium: {
      type: Number,
      default: 0,
      min: [0, 'Sodium cannot be negative']
    }
  },
  prepTime: {
    type: Number, // in minutes
    min: [0, 'Prep time cannot be negative']
  },
  cookTime: {
    type: Number, // in minutes
    min: [0, 'Cook time cannot be negative']
  },
  instructions: [String],
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  imageUrl: String,
  rating: {
    average: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 1
    },
    count: {
      type: Number,
      default: 0
    }
  }
});

const nutritionPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nutrition plan name is required'],
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  goal: {
    type: String,
    enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'performance'],
    required: true
  },
  targetCalories: {
    type: Number,
    required: [true, 'Target calories are required'],
    min: [1000, 'Target calories must be at least 1000'],
    max: [5000, 'Target calories cannot exceed 5000']
  },
  macroTargets: {
    protein: {
      grams: {
        type: Number,
        required: true,
        min: [0, 'Protein target cannot be negative']
      },
      percentage: {
        type: Number,
        min: [10, 'Protein percentage must be at least 10%'],
        max: [50, 'Protein percentage cannot exceed 50%']
      }
    },
    carbohydrates: {
      grams: {
        type: Number,
        required: true,
        min: [0, 'Carbohydrate target cannot be negative']
      },
      percentage: {
        type: Number,
        min: [20, 'Carbohydrate percentage must be at least 20%'],
        max: [70, 'Carbohydrate percentage cannot exceed 70%']
      }
    },
    fat: {
      grams: {
        type: Number,
        required: true,
        min: [0, 'Fat target cannot be negative']
      },
      percentage: {
        type: Number,
        min: [15, 'Fat percentage must be at least 15%'],
        max: [50, 'Fat percentage cannot exceed 50%']
      }
    }
  },
  meals: [mealSchema],
  schedule: {
    mealsPerDay: {
      type: Number,
      min: [3, 'Must have at least 3 meals per day'],
      max: [6, 'Cannot have more than 6 meals per day'],
      default: 3
    },
    mealTiming: [{
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout']
      },
      time: String, // "07:00", "12:30", etc.
      calories: Number
    }]
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
  }],
  allergies: [String],
  waterIntakeTarget: {
    type: Number, // in liters
    min: [1, 'Water intake must be at least 1 liter'],
    max: [8, 'Water intake cannot exceed 8 liters'],
    default: 2.5
  },
  supplementRecommendations: [{
    name: String,
    dosage: String,
    timing: String,
    reason: String
  }],
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String,
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});

const nutritionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  meals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'],
      required: true
    },
    time: Date,
    foods: [{
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem'
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        amount: {
          type: Number,
          required: true,
          min: [0, 'Quantity cannot be negative']
        },
        unit: {
          type: String,
          required: true
        }
      },
      nutrition: {
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fat: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number
      }
    }],
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 }
    }
  }],
  dailyTotals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  waterIntake: {
    type: Number, // in liters
    min: [0, 'Water intake cannot be negative'],
    default: 0
  },
  supplements: [{
    name: String,
    dosage: String,
    time: Date,
    taken: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'poor', 'terrible']
  },
  energyLevel: {
    type: String,
    enum: ['very-high', 'high', 'normal', 'low', 'very-low']
  },
  adherenceScore: {
    type: Number, // percentage of plan followed
    min: [0, 'Adherence score cannot be negative'],
    max: [100, 'Adherence score cannot exceed 100'],
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
foodItemSchema.index({ name: 'text', brand: 'text' });
foodItemSchema.index({ category: 1, dietaryFlags: 1 });
foodItemSchema.index({ barcode: 1 }, { sparse: true });

nutritionPlanSchema.index({ userId: 1, isActive: 1 });
nutritionPlanSchema.index({ goal: 1, dietaryRestrictions: 1 });

nutritionLogSchema.index({ userId: 1, date: -1 });
nutritionLogSchema.index({ userId: 1, 'meals.mealType': 1, date: -1 });

// Calculate total nutrition for a meal
mealSchema.methods.calculateTotalNutrition = function() {
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  this.foods.forEach(food => {
    if (food.nutrition) {
      Object.keys(totals).forEach(nutrient => {
        totals[nutrient] += food.nutrition[nutrient] || 0;
      });
    }
  });

  this.totalNutrition = totals;
  return totals;
};

// Calculate daily nutrition totals
nutritionLogSchema.methods.calculateDailyTotals = function() {
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  this.meals.forEach(meal => {
    if (meal.totalNutrition) {
      Object.keys(totals).forEach(nutrient => {
        totals[nutrient] += meal.totalNutrition[nutrient] || 0;
      });
    }
  });

  this.dailyTotals = totals;
  return totals;
};

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);
const NutritionLog = mongoose.model('NutritionLog', nutritionLogSchema);

module.exports = { FoodItem, NutritionPlan, NutritionLog };