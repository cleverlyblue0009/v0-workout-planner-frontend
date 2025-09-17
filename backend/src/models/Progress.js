const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
  weight: {
    type: Number,
    min: [30, 'Weight must be at least 30kg'],
    max: [500, 'Weight must be less than 500kg']
  },
  bodyFatPercentage: {
    type: Number,
    min: [3, 'Body fat percentage must be at least 3%'],
    max: [50, 'Body fat percentage must be less than 50%']
  },
  muscleMass: {
    type: Number,
    min: [0, 'Muscle mass cannot be negative']
  },
  measurements: {
    chest: Number, // in cm
    waist: Number,
    hips: Number,
    biceps: {
      left: Number,
      right: Number
    },
    thighs: {
      left: Number,
      right: Number
    },
    neck: Number,
    shoulders: Number,
    forearms: {
      left: Number,
      right: Number
    },
    calves: {
      left: Number,
      right: Number
    }
  },
  visceralFat: {
    type: Number,
    min: [1, 'Visceral fat level must be at least 1'],
    max: [30, 'Visceral fat level cannot exceed 30']
  },
  bmi: {
    type: Number,
    min: [10, 'BMI must be at least 10'],
    max: [50, 'BMI cannot exceed 50']
  }
});

const fitnessMetricSchema = new mongoose.Schema({
  cardiovascular: {
    restingHeartRate: {
      type: Number,
      min: [40, 'Resting heart rate must be at least 40 bpm'],
      max: [120, 'Resting heart rate cannot exceed 120 bpm']
    },
    maxHeartRate: {
      type: Number,
      min: [120, 'Max heart rate must be at least 120 bpm'],
      max: [220, 'Max heart rate cannot exceed 220 bpm']
    },
    vo2Max: {
      type: Number,
      min: [10, 'VO2 Max must be at least 10'],
      max: [80, 'VO2 Max cannot exceed 80']
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: [70, 'Systolic pressure must be at least 70'],
        max: [200, 'Systolic pressure cannot exceed 200']
      },
      diastolic: {
        type: Number,
        min: [40, 'Diastolic pressure must be at least 40'],
        max: [120, 'Diastolic pressure cannot exceed 120']
      }
    }
  },
  strength: {
    benchPress: { // 1RM in kg
      type: Number,
      min: [0, 'Bench press cannot be negative']
    },
    squat: { // 1RM in kg
      type: Number,
      min: [0, 'Squat cannot be negative']
    },
    deadlift: { // 1RM in kg
      type: Number,
      min: [0, 'Deadlift cannot be negative']
    },
    overheadPress: { // 1RM in kg
      type: Number,
      min: [0, 'Overhead press cannot be negative']
    },
    pullUps: { // max reps
      type: Number,
      min: [0, 'Pull-ups cannot be negative']
    },
    pushUps: { // max reps
      type: Number,
      min: [0, 'Push-ups cannot be negative']
    }
  },
  flexibility: {
    sitAndReach: { // in cm
      type: Number,
      min: [-30, 'Sit and reach cannot be less than -30cm'],
      max: [60, 'Sit and reach cannot exceed 60cm']
    },
    shoulderMobility: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor', 'very-poor']
    },
    hipMobility: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor', 'very-poor']
    }
  },
  endurance: {
    fiveKTime: { // in seconds
      type: Number,
      min: [600, '5K time must be at least 10 minutes'],
      max: [3600, '5K time cannot exceed 60 minutes']
    },
    tenKTime: { // in seconds
      type: Number,
      min: [1200, '10K time must be at least 20 minutes'],
      max: [7200, '10K time cannot exceed 120 minutes']
    },
    plankTime: { // in seconds
      type: Number,
      min: [0, 'Plank time cannot be negative'],
      max: [600, 'Plank time cannot exceed 10 minutes']
    }
  }
});

const progressEntrySchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'milestone', 'custom'],
    default: 'custom'
  },
  bodyMeasurements: bodyMeasurementSchema,
  fitnessMetrics: fitnessMetricSchema,
  photos: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['front', 'side', 'back', 'other'],
      default: 'front'
    },
    description: String
  }],
  goals: [{
    category: {
      type: String,
      enum: ['weight', 'strength', 'endurance', 'flexibility', 'body-composition', 'habit'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [200, 'Goal description cannot exceed 200 characters']
    },
    targetValue: Number,
    currentValue: Number,
    unit: String,
    targetDate: Date,
    achieved: {
      type: Boolean,
      default: false
    },
    achievedDate: Date
  }],
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['workout', 'nutrition', 'progress', 'consistency', 'milestone', 'personal-record'],
      required: true
    },
    value: Number,
    unit: String
  }],
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'poor', 'terrible']
  },
  energyLevel: {
    type: String,
    enum: ['very-high', 'high', 'normal', 'low', 'very-low']
  },
  sleepQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'very-poor']
  },
  stressLevel: {
    type: String,
    enum: ['very-low', 'low', 'moderate', 'high', 'very-high']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Goal title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Goal description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'strength', 'endurance', 'flexibility', 'habit', 'nutrition', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  targetValue: {
    type: Number,
    min: [0, 'Target value cannot be negative']
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs', 'cm', 'inches', 'minutes', 'seconds', 'reps', 'days', 'weeks', 'percent', 'other']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  milestones: [{
    title: String,
    description: String,
    targetValue: Number,
    targetDate: Date,
    achieved: {
      type: Boolean,
      default: false
    },
    achievedDate: Date
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  achieved: {
    type: Boolean,
    default: false
  },
  achievedDate: Date,
  progress: {
    type: Number, // percentage (0-100)
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better performance
progressEntrySchema.index({ userId: 1, date: -1 });
progressEntrySchema.index({ userId: 1, type: 1, date: -1 });

goalSchema.index({ userId: 1, status: 1, targetDate: 1 });
goalSchema.index({ userId: 1, category: 1, priority: -1 });

// Calculate BMI from weight and height
bodyMeasurementSchema.methods.calculateBMI = function(height) {
  if (this.weight && height) {
    const heightInMeters = height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
};

// Calculate goal progress percentage
goalSchema.methods.calculateProgress = function() {
  if (this.targetValue && this.targetValue > 0) {
    const progress = (this.currentValue / this.targetValue) * 100;
    this.progress = Math.min(100, Math.max(0, progress));
    
    if (this.progress >= 100 && !this.achieved) {
      this.achieved = true;
      this.achievedDate = new Date();
      this.status = 'completed';
    }
    
    return this.progress;
  }
  return 0;
};

// Get time remaining for goal
goalSchema.methods.getTimeRemaining = function() {
  const now = new Date();
  const timeDiff = this.targetDate - now;
  
  if (timeDiff <= 0) {
    return { expired: true };
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  return {
    expired: false,
    days,
    weeks,
    months,
    milliseconds: timeDiff
  };
};

// Calculate fitness score based on various metrics
progressEntrySchema.methods.calculateFitnessScore = function() {
  let score = 0;
  let factors = 0;
  
  // Body composition (30% weight)
  if (this.bodyMeasurements?.bodyFatPercentage) {
    const bfp = this.bodyMeasurements.bodyFatPercentage;
    let bfpScore = 0;
    
    // Scoring based on healthy ranges (simplified)
    if (bfp >= 10 && bfp <= 18) bfpScore = 100; // Excellent
    else if (bfp >= 19 && bfp <= 25) bfpScore = 80; // Good
    else if (bfp >= 26 && bfp <= 30) bfpScore = 60; // Average
    else bfpScore = 40; // Below average
    
    score += bfpScore * 0.3;
    factors += 0.3;
  }
  
  // Cardiovascular health (25% weight)
  if (this.fitnessMetrics?.cardiovascular?.restingHeartRate) {
    const rhr = this.fitnessMetrics.cardiovascular.restingHeartRate;
    let rhrScore = 0;
    
    if (rhr <= 60) rhrScore = 100; // Excellent
    else if (rhr <= 70) rhrScore = 80; // Good
    else if (rhr <= 80) rhrScore = 60; // Average
    else rhrScore = 40; // Below average
    
    score += rhrScore * 0.25;
    factors += 0.25;
  }
  
  // Strength (25% weight)
  if (this.fitnessMetrics?.strength) {
    const strength = this.fitnessMetrics.strength;
    let strengthScore = 0;
    let strengthFactors = 0;
    
    if (strength.pushUps) {
      if (strength.pushUps >= 40) strengthScore += 100;
      else if (strength.pushUps >= 25) strengthScore += 80;
      else if (strength.pushUps >= 15) strengthScore += 60;
      else strengthScore += 40;
      strengthFactors++;
    }
    
    if (strength.pullUps) {
      if (strength.pullUps >= 15) strengthScore += 100;
      else if (strength.pullUps >= 8) strengthScore += 80;
      else if (strength.pullUps >= 3) strengthScore += 60;
      else strengthScore += 40;
      strengthFactors++;
    }
    
    if (strengthFactors > 0) {
      score += (strengthScore / strengthFactors) * 0.25;
      factors += 0.25;
    }
  }
  
  // Flexibility (20% weight)
  if (this.fitnessMetrics?.flexibility?.sitAndReach !== undefined) {
    const sr = this.fitnessMetrics.flexibility.sitAndReach;
    let flexScore = 0;
    
    if (sr >= 20) flexScore = 100; // Excellent
    else if (sr >= 10) flexScore = 80; // Good
    else if (sr >= 0) flexScore = 60; // Average
    else flexScore = 40; // Below average
    
    score += flexScore * 0.2;
    factors += 0.2;
  }
  
  return factors > 0 ? Math.round(score / factors) : 0;
};

const ProgressEntry = mongoose.model('ProgressEntry', progressEntrySchema);
const Goal = mongoose.model('Goal', goalSchema);

module.exports = { ProgressEntry, Goal };