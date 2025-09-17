const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age must be less than 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    height: {
      type: Number, // in cm
      min: [100, 'Height must be at least 100cm'],
      max: [250, 'Height must be less than 250cm']
    },
    weight: {
      type: Number, // in kg
      min: [30, 'Weight must be at least 30kg'],
      max: [500, 'Weight must be less than 500kg']
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
      default: 'moderately-active'
    },
    fitnessGoal: {
      type: String,
      enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'strength', 'endurance', 'general-fitness', 'maintenance'],
      default: 'general-fitness'
    },
    targetWeight: {
      type: Number,
      min: [30, 'Target weight must be at least 30kg'],
      max: [500, 'Target weight must be less than 500kg']
    },
    medicalConditions: [String],
    injuries: [String]
  },
  preferences: {
    equipment: {
      type: String,
      enum: ['full-gym', 'home-basic', 'bodyweight', 'dumbbells', 'resistance-bands', 'minimal'],
      default: 'bodyweight'
    },
    workoutStyle: {
      type: String,
      enum: ['strength-training', 'hiit', 'cardio', 'yoga-pilates', 'mixed', 'bodyweight'],
      default: 'mixed'
    },
    workoutDuration: {
      type: String,
      enum: ['15-30', '30-45', '45-60', '60+'],
      default: '30-45'
    },
    workoutFrequency: {
      type: Number,
      min: [1, 'Workout frequency must be at least 1 day per week'],
      max: [7, 'Workout frequency cannot exceed 7 days per week'],
      default: 3
    },
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
    }],
    allergies: [String],
    dislikedFoods: [String],
    mealPreferences: {
      mealsPerDay: {
        type: Number,
        min: [3, 'Must have at least 3 meals per day'],
        max: [6, 'Cannot have more than 6 meals per day'],
        default: 3
      },
      cookingTime: {
        type: String,
        enum: ['minimal', 'moderate', 'extensive'],
        default: 'moderate'
      }
    }
  },
  nutritionGoals: {
    targetCalories: {
      type: Number,
      min: [1000, 'Target calories must be at least 1000'],
      max: [5000, 'Target calories cannot exceed 5000']
    },
    macroRatios: {
      protein: {
        type: Number,
        min: [10, 'Protein ratio must be at least 10%'],
        max: [50, 'Protein ratio cannot exceed 50%'],
        default: 25
      },
      carbs: {
        type: Number,
        min: [20, 'Carb ratio must be at least 20%'],
        max: [70, 'Carb ratio cannot exceed 70%'],
        default: 45
      },
      fats: {
        type: Number,
        min: [15, 'Fat ratio must be at least 15%'],
        max: [50, 'Fat ratio cannot exceed 50%'],
        default: 30
      }
    }
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastWorkoutDate: Date
  },
  achievements: [{
    title: String,
    description: String,
    achievedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['workout', 'nutrition', 'progress', 'consistency', 'milestone']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate BMI
userSchema.methods.calculateBMI = function() {
  if (this.profile.weight && this.profile.height) {
    const heightInMeters = this.profile.height / 100;
    return (this.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
};

// Calculate BMR (Basal Metabolic Rate)
userSchema.methods.calculateBMR = function() {
  if (this.profile.weight && this.profile.height && this.profile.age && this.profile.gender) {
    let bmr;
    if (this.profile.gender === 'male') {
      bmr = 88.362 + (13.397 * this.profile.weight) + (4.799 * this.profile.height) - (5.677 * this.profile.age);
    } else {
      bmr = 447.593 + (9.247 * this.profile.weight) + (3.098 * this.profile.height) - (4.330 * this.profile.age);
    }
    return Math.round(bmr);
  }
  return null;
};

// Calculate TDEE (Total Daily Energy Expenditure)
userSchema.methods.calculateTDEE = function() {
  const bmr = this.calculateBMR();
  if (!bmr) return null;

  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly-active': 1.375,
    'moderately-active': 1.55,
    'very-active': 1.725,
    'extremely-active': 1.9
  };

  const multiplier = activityMultipliers[this.profile.activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

// Update streak based on workout completion
userSchema.methods.updateStreak = function(workoutDate = new Date()) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!this.streak.lastWorkoutDate) {
    // First workout
    this.streak.current = 1;
    this.streak.lastWorkoutDate = workoutDate;
  } else {
    const lastWorkout = new Date(this.streak.lastWorkoutDate);
    const daysDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.streak.current += 1;
      this.streak.lastWorkoutDate = workoutDate;
    } else if (daysDiff > 1) {
      // Streak broken
      this.streak.current = 1;
      this.streak.lastWorkoutDate = workoutDate;
    }
    // If daysDiff === 0, same day workout, don't change streak
  }

  // Update longest streak
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
};

module.exports = mongoose.model('User', userSchema);