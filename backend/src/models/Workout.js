const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructions: [String],
  targetMuscles: [{
    type: String,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'abs', 'obliques', 'lower-back', 'glutes', 'quadriceps', 
      'hamstrings', 'calves', 'hip-flexors', 'full-body', 'cardio'
    ]
  }],
  equipment: {
    type: String,
    enum: ['bodyweight', 'dumbbells', 'barbell', 'resistance-bands', 'kettlebell', 'machine', 'cable', 'medicine-ball', 'other'],
    default: 'bodyweight'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  sets: {
    type: Number,
    min: [1, 'Must have at least 1 set'],
    max: [10, 'Cannot exceed 10 sets'],
    required: true
  },
  reps: {
    min: Number,
    max: Number,
    target: Number
  },
  duration: {
    type: Number, // in seconds for timed exercises
  },
  distance: {
    type: Number, // in meters for cardio exercises
  },
  weight: {
    type: Number, // in kg
    min: [0, 'Weight cannot be negative']
  },
  restTime: {
    type: Number, // in seconds
    min: [0, 'Rest time cannot be negative'],
    default: 60
  },
  notes: String,
  videoUrl: String,
  imageUrl: String,
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative']
  }
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Workout plan name is required'],
    trim: true,
    maxlength: [100, 'Workout plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  goal: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'strength', 'endurance', 'general-fitness', 'flexibility'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number, // total workout duration in minutes
    min: [5, 'Workout must be at least 5 minutes'],
    max: [180, 'Workout cannot exceed 180 minutes']
  },
  equipment: {
    type: String,
    enum: ['full-gym', 'home-basic', 'bodyweight', 'dumbbells', 'resistance-bands', 'minimal'],
    required: true
  },
  workoutType: {
    type: String,
    enum: ['strength-training', 'hiit', 'cardio', 'yoga-pilates', 'mixed', 'flexibility'],
    required: true
  },
  exercises: [exerciseSchema],
  schedule: {
    daysPerWeek: {
      type: Number,
      min: [1, 'Must workout at least 1 day per week'],
      max: [7, 'Cannot workout more than 7 days per week'],
      default: 3
    },
    weeklySchedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      restDay: {
        type: Boolean,
        default: false
      }
    }],
    programLength: {
      type: Number, // in weeks
      min: [1, 'Program must be at least 1 week'],
      max: [52, 'Program cannot exceed 52 weeks'],
      default: 12
    }
  },
  estimatedCaloriesBurn: {
    type: Number,
    min: [0, 'Estimated calories burn cannot be negative']
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String, // Store the original AI prompt for regeneration
  rating: {
    average: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // actual duration in minutes
    min: [0, 'Duration cannot be negative']
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sets: [{
      setNumber: {
        type: Number,
        required: true,
        min: [1, 'Set number must be at least 1']
      },
      reps: Number,
      weight: Number, // in kg
      duration: Number, // in seconds
      distance: Number, // in meters
      restTime: Number, // in seconds
      completed: {
        type: Boolean,
        default: false
      },
      notes: String
    }],
    completed: {
      type: Boolean,
      default: false
    },
    skipped: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  totalCaloriesBurned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative'],
    default: 0
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  mood: {
    before: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'tired', 'unmotivated']
    },
    after: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'tired', 'exhausted']
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
workoutPlanSchema.index({ userId: 1, isActive: 1 });
workoutPlanSchema.index({ goal: 1, difficulty: 1, equipment: 1 });
workoutPlanSchema.index({ isPublic: 1, 'rating.average': -1 });

workoutSessionSchema.index({ userId: 1, startTime: -1 });
workoutSessionSchema.index({ workoutPlanId: 1, completed: 1 });

// Calculate workout statistics
workoutPlanSchema.methods.getStats = async function() {
  const WorkoutSession = mongoose.model('WorkoutSession');
  
  const stats = await WorkoutSession.aggregate([
    { $match: { workoutPlanId: this._id, completed: true } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        totalCalories: { $sum: '$totalCaloriesBurned' },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  return stats[0] || {
    totalSessions: 0,
    avgDuration: 0,
    totalCalories: 0,
    avgRating: 0
  };
};

// Calculate session progress
workoutSessionSchema.methods.calculateProgress = function() {
  const totalExercises = this.exercises.length;
  const completedExercises = this.exercises.filter(ex => ex.completed).length;
  
  let totalSets = 0;
  let completedSets = 0;
  
  this.exercises.forEach(exercise => {
    totalSets += exercise.sets.length;
    completedSets += exercise.sets.filter(set => set.completed).length;
  });

  return {
    exerciseProgress: totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0,
    setProgress: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
    overallProgress: totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  };
};

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

module.exports = { WorkoutPlan, WorkoutSession };