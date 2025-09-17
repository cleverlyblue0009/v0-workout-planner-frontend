const { openai, WORKOUT_SYSTEM_PROMPT, NUTRITION_SYSTEM_PROMPT, PROGRESS_SYSTEM_PROMPT } = require('../config/openai');
const LocationService = require('./locationService');

class AIService {
  // Generate personalized workout plan
  static async generateWorkoutPlan(userProfile, preferences) {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found, using fallback workout plan');
        return this.generateFallbackWorkoutPlan(userProfile, preferences);
      }

      const prompt = this.buildWorkoutPrompt(userProfile, preferences);
      
      console.log('Calling OpenAI API for workout plan generation...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: WORKOUT_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const workoutPlan = this.parseWorkoutResponse(response.choices[0].message.content);
      console.log('Successfully generated AI workout plan');
      return workoutPlan;
    } catch (error) {
      console.error('AI workout generation error:', error.message);
      console.warn('Falling back to template workout plan');
      return this.generateFallbackWorkoutPlan(userProfile, preferences);
    }
  }

  // Generate personalized nutrition plan
  static async generateNutritionPlan(userProfile, preferences, nutritionGoals, location = null, workoutGoals = null) {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found, using fallback nutrition plan');
        return this.generateFallbackNutritionPlan(userProfile, nutritionGoals, workoutGoals);
      }

      const prompt = this.buildNutritionPrompt(userProfile, preferences, nutritionGoals, location, workoutGoals);
      
      console.log('Calling OpenAI API for nutrition plan generation...');
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: NUTRITION_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const nutritionPlan = this.parseNutritionResponse(response.choices[0].message.content);
      console.log('Successfully generated AI nutrition plan');
      return nutritionPlan;
    } catch (error) {
      console.error('AI nutrition generation error:', error.message);
      console.warn('Falling back to template nutrition plan');
      return this.generateFallbackNutritionPlan(userProfile, nutritionGoals, workoutGoals);
    }
  }

  // Analyze progress and provide recommendations
  static async analyzeProgress(userProfile, workoutHistory, nutritionHistory, progressData) {
    try {
      const prompt = this.buildProgressPrompt(userProfile, workoutHistory, nutritionHistory, progressData);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: PROGRESS_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.6
      });

      const analysis = this.parseProgressResponse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('AI progress analysis error:', error);
      throw new Error('Failed to analyze progress');
    }
  }

  // Get personalized recommendations
  static async getRecommendations(userProfile, currentPlan, recentActivity) {
    try {
      const prompt = `
Based on the following user information, provide 3-5 personalized recommendations:

User Profile:
- Goal: ${userProfile.fitnessGoal}
- Experience: ${userProfile.experience || 'intermediate'}
- Equipment: ${userProfile.equipment}
- Activity Level: ${userProfile.activityLevel}

Current Plan: ${currentPlan?.name || 'No active plan'}
Recent Activity: ${recentActivity}

Provide specific, actionable recommendations for:
1. Workout improvements
2. Nutrition adjustments
3. Habit formation
4. Motivation tips

Format as JSON with recommendation objects containing title, description, and category.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a fitness coach providing personalized recommendations. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const recommendations = JSON.parse(response.choices[0].message.content);
      return recommendations;
    } catch (error) {
      console.error('AI recommendations error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  // Build workout generation prompt
  static buildWorkoutPrompt(userProfile, preferences) {
    return `
Create a personalized workout plan with the following specifications:

User Profile:
- Age: ${userProfile.age || 'not specified'}
- Gender: ${userProfile.gender || 'not specified'}
- Weight: ${userProfile.weight || 'not specified'} kg
- Height: ${userProfile.height || 'not specified'} cm
- Fitness Goal: ${userProfile.fitnessGoal}
- Activity Level: ${userProfile.activityLevel}
- Experience Level: ${preferences.experience || 'intermediate'}

Preferences:
- Equipment Available: ${preferences.equipment}
- Workout Style: ${preferences.workoutStyle}
- Time per Session: ${preferences.workoutDuration}
- Frequency: ${preferences.workoutFrequency} days per week
- Medical Conditions: ${userProfile.medicalConditions?.join(', ') || 'none'}
- Injuries: ${userProfile.injuries?.join(', ') || 'none'}

Please provide:
1. A structured workout plan name and description
2. Weekly schedule (which days to work out)
3. Detailed exercises for each workout day with:
   - Exercise name and description
   - Target muscle groups
   - Sets and reps (or duration for cardio)
   - Rest periods
   - Form tips and safety notes
4. Progression recommendations
5. Estimated calories burned per session

Format the response as a structured JSON object that can be easily parsed.
    `;
  }

  // Build nutrition generation prompt
  static buildNutritionPrompt(userProfile, preferences, nutritionGoals, location = null, workoutGoals = null) {
    let locationInfo = '';
    let regionalPreferences = '';
    let climateRecommendations = '';
    let workoutNutritionInfo = '';

    if (location) {
      locationInfo = `
Location Information:
- Country: ${location.country || 'not specified'}
- Region: ${location.region || 'not specified'}
- City: ${location.city || 'not specified'}
- Coordinates: ${location.latitude || 'N/A'}, ${location.longitude || 'N/A'}
- Timezone: ${location.timezone || 'not specified'}`;

      // Get regional food preferences
      const regional = LocationService.getRegionalFoodPreferences(location);
      regionalPreferences = `
Regional Food Preferences:
- Cuisine Types: ${regional.cuisineTypes.join(', ')}
- Common Ingredients: ${regional.commonIngredients.join(', ')}
- Meal Patterns: ${regional.mealPatterns.join(', ')}
- Seasonal Considerations: ${regional.seasonalConsiderations}`;

      // Get climate-based recommendations
      const climate = LocationService.getClimateRecommendations(location);
      climateRecommendations = `
Climate-Based Recommendations:
- Hydration Level: ${climate.hydrationLevel}
- Food Temperature Preference: ${climate.foodTemperature}
- Seasonal Focus: ${climate.seasonalFocus}`;

      locationInfo += '\n\nPlease consider local/regional food availability, seasonal ingredients, cultural food preferences, and climate-appropriate foods for this location.';
    }

    if (workoutGoals) {
      workoutNutritionInfo = `
Current Workout Plan Information:
- Fitness Goal: ${workoutGoals.goal}
- Workout Difficulty: ${workoutGoals.difficulty}
- Session Duration: ${workoutGoals.duration} minutes
- Workout Type: ${workoutGoals.workoutType}
- Estimated Calories Burned per Session: ${workoutGoals.estimatedCaloriesBurn || 'not specified'}

IMPORTANT: Adjust nutrition recommendations based on this workout plan:
- Include pre-workout nutrition suggestions (timing, macros)
- Include post-workout recovery nutrition (protein timing, carb replenishment)
- Consider increased protein needs for muscle recovery
- Adjust hydration needs based on workout intensity
- Include workout day vs rest day meal variations if applicable
- Consider timing of meals around workouts`;
    }

    return `
Create a personalized nutrition plan with the following specifications:

User Profile:
- Age: ${userProfile.age || 'not specified'}
- Gender: ${userProfile.gender || 'not specified'}
- Weight: ${userProfile.weight || 'not specified'} kg
- Height: ${userProfile.height || 'not specified'} cm
- Activity Level: ${userProfile.activityLevel}
- Fitness Goal: ${userProfile.fitnessGoal}
${locationInfo}
${regionalPreferences}
${climateRecommendations}
${workoutNutritionInfo}

Nutrition Goals:
- Target Calories: ${nutritionGoals.targetCalories}
- Protein: ${nutritionGoals.macroRatios.protein}%
- Carbohydrates: ${nutritionGoals.macroRatios.carbs}%
- Fat: ${nutritionGoals.macroRatios.fats}%

Dietary Preferences:
- Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
- Allergies: ${preferences.allergies?.join(', ') || 'none'}
- Disliked Foods: ${preferences.dislikedFoods?.join(', ') || 'none'}
- Meals per Day: ${preferences.mealPreferences?.mealsPerDay || 3}
- Cooking Time: ${preferences.mealPreferences?.cookingTime || 'moderate'}

Please provide:
1. A complete daily meal plan with:
   - Breakfast, lunch, dinner, and snacks (if applicable)
   - Specific food items with portions that are locally available
   - Nutritional breakdown for each meal
   - Consider seasonal ingredients and local cuisine preferences
   - Include pre and post-workout nutrition if workout plan is provided
2. Weekly meal rotation suggestions using regional foods
3. Shopping list for the week with locally available ingredients
4. Meal prep tips suitable for the local climate and lifestyle
5. Hydration recommendations based on climate and activity level
6. Workout-specific nutrition timing and recommendations (if workout plan provided):
   - Pre-workout meal/snack suggestions with timing
   - Post-workout recovery nutrition
   - Workout day vs rest day variations
   - Supplement recommendations if needed

Format the response as a structured JSON object that can be easily parsed with the following structure:
{
  "name": "plan name",
  "description": "plan description", 
  "meals": [array of meal objects with foods and nutrition],
  "schedule": {"mealTiming": [array of meal timing objects]},
  "workoutNutrition": {
    "preWorkout": {"foods": [], "timing": "", "notes": ""},
    "postWorkout": {"foods": [], "timing": "", "notes": ""},
    "workoutDayAdjustments": "",
    "restDayAdjustments": ""
  },
  "waterIntakeTarget": number,
  "weeklyRotations": [array of alternative meal suggestions],
  "shoppingList": [array of ingredients],
  "mealPrepTips": [array of tips]
}
    `;
  }

  // Build progress analysis prompt
  static buildProgressPrompt(userProfile, workoutHistory, nutritionHistory, progressData) {
    return `
Analyze the following fitness progress data and provide insights:

User Profile:
- Goal: ${userProfile.fitnessGoal}
- Starting Weight: ${progressData.startingWeight || 'not specified'} kg
- Current Weight: ${progressData.currentWeight || 'not specified'} kg
- Target Weight: ${userProfile.targetWeight || 'not specified'} kg

Recent Workout Performance:
- Sessions Completed: ${workoutHistory.totalSessions || 0}
- Average Duration: ${workoutHistory.avgDuration || 0} minutes
- Total Calories Burned: ${workoutHistory.totalCalories || 0}
- Consistency: ${workoutHistory.consistency || 0}%

Nutrition Adherence:
- Average Daily Calories: ${nutritionHistory.avgCalories || 0}
- Protein Intake: ${nutritionHistory.avgProtein || 0}g
- Adherence Score: ${nutritionHistory.adherenceScore || 0}%

Progress Metrics:
- Weight Change: ${progressData.weightChange || 0} kg
- Body Fat Change: ${progressData.bodyFatChange || 0}%
- Strength Improvements: ${progressData.strengthGains || 'none specified'}

Please provide:
1. Overall progress assessment
2. Areas of success
3. Areas needing improvement
4. Specific recommendations for next steps
5. Motivational insights
6. Goal timeline predictions

Format the response as a structured JSON object.
    `;
  }

  // Parse workout response from AI
  static parseWorkoutResponse(response) {
    try {
      // Try to parse as JSON first
      return JSON.parse(response);
    } catch (error) {
      // If not JSON, parse manually (fallback)
      return {
        name: 'AI Generated Workout Plan',
        description: 'Personalized workout plan generated by AI',
        goal: 'general-fitness',
        difficulty: 'intermediate',
        duration: 45,
        equipment: 'bodyweight',
        workoutType: 'mixed',
        exercises: [
          {
            name: 'Push-ups',
            description: 'Classic bodyweight chest exercise',
            targetMuscles: ['chest', 'shoulders', 'triceps'],
            equipment: 'bodyweight',
            difficulty: 'intermediate',
            sets: 3,
            reps: { min: 10, max: 15, target: 12 },
            restTime: 60,
            instructions: ['Keep body straight', 'Lower chest to ground', 'Push back up']
          }
        ],
        schedule: {
          daysPerWeek: 3,
          programLength: 12
        },
        estimatedCaloriesBurn: 300,
        isAIGenerated: true,
        aiPrompt: response
      };
    }
  }

  // Parse nutrition response from AI
  static parseNutritionResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback nutrition plan
      return {
        name: 'AI Generated Nutrition Plan',
        description: 'Personalized nutrition plan generated by AI',
        goal: 'maintenance',
        targetCalories: 2000,
        macroTargets: {
          protein: { grams: 150, percentage: 30 },
          carbohydrates: { grams: 200, percentage: 40 },
          fat: { grams: 67, percentage: 30 }
        },
        meals: [
          {
            name: 'Balanced Breakfast',
            type: 'breakfast',
            foods: [],
            totalNutrition: { calories: 400, protein: 20, carbohydrates: 40, fat: 15 }
          }
        ],
        isAIGenerated: true,
        aiPrompt: response
      };
    }
  }

  // Parse progress response from AI
  static parseProgressResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback analysis
      return {
        overallAssessment: 'Making good progress',
        strengths: ['Consistency in workouts'],
        improvements: ['Increase protein intake'],
        recommendations: ['Continue current routine'],
        motivation: 'Keep up the great work!',
        timelineProjection: 'On track to reach goals'
      };
    }
  }

  // Generate fallback nutrition plan when AI is not available
  static generateFallbackNutritionPlan(userProfile, nutritionGoals, workoutGoals = null) {
    const targetCalories = nutritionGoals.targetCalories || 2000;
    const proteinGrams = Math.round((targetCalories * nutritionGoals.macroRatios.protein / 100) / 4);
    const carbGrams = Math.round((targetCalories * nutritionGoals.macroRatios.carbs / 100) / 4);
    const fatGrams = Math.round((targetCalories * nutritionGoals.macroRatios.fats / 100) / 9);

    // Basic meal distribution (breakfast: 25%, lunch: 35%, dinner: 30%, snacks: 10%)
    const breakfastCals = Math.round(targetCalories * 0.25);
    const lunchCals = Math.round(targetCalories * 0.35);
    const dinnerCals = Math.round(targetCalories * 0.30);
    const snackCals = Math.round(targetCalories * 0.10);

    return {
      name: 'Balanced Nutrition Plan',
      description: `A balanced ${targetCalories}-calorie meal plan designed for your fitness goals`,
      goal: userProfile.fitnessGoal || 'maintenance',
      targetCalories: targetCalories,
      macroTargets: {
        protein: { grams: proteinGrams, percentage: nutritionGoals.macroRatios.protein },
        carbohydrates: { grams: carbGrams, percentage: nutritionGoals.macroRatios.carbs },
        fat: { grams: fatGrams, percentage: nutritionGoals.macroRatios.fats }
      },
      meals: [
        {
          name: 'Balanced Breakfast',
          type: 'breakfast',
          totalNutrition: {
            calories: breakfastCals,
            protein: Math.round(proteinGrams * 0.25),
            carbohydrates: Math.round(carbGrams * 0.25),
            fat: Math.round(fatGrams * 0.25)
          },
          foods: [
            {
              name: 'Greek Yogurt with Berries',
              quantity: { amount: 1, unit: 'cup' },
              nutrition: {
                calories: Math.round(breakfastCals * 0.6),
                protein: Math.round(proteinGrams * 0.15),
                carbohydrates: Math.round(carbGrams * 0.15),
                fat: Math.round(fatGrams * 0.1)
              }
            },
            {
              name: 'Whole Grain Toast',
              quantity: { amount: 1, unit: 'slice' },
              nutrition: {
                calories: Math.round(breakfastCals * 0.4),
                protein: Math.round(proteinGrams * 0.1),
                carbohydrates: Math.round(carbGrams * 0.1),
                fat: Math.round(fatGrams * 0.15)
              }
            }
          ]
        },
        {
          name: 'Protein-Rich Lunch',
          type: 'lunch',
          totalNutrition: {
            calories: lunchCals,
            protein: Math.round(proteinGrams * 0.35),
            carbohydrates: Math.round(carbGrams * 0.35),
            fat: Math.round(fatGrams * 0.35)
          },
          foods: [
            {
              name: 'Grilled Chicken Salad',
              quantity: { amount: 1, unit: 'large bowl' },
              nutrition: {
                calories: lunchCals,
                protein: Math.round(proteinGrams * 0.35),
                carbohydrates: Math.round(carbGrams * 0.35),
                fat: Math.round(fatGrams * 0.35)
              }
            }
          ]
        },
        {
          name: 'Balanced Dinner',
          type: 'dinner',
          totalNutrition: {
            calories: dinnerCals,
            protein: Math.round(proteinGrams * 0.30),
            carbohydrates: Math.round(carbGrams * 0.30),
            fat: Math.round(fatGrams * 0.30)
          },
          foods: [
            {
              name: 'Baked Salmon with Vegetables',
              quantity: { amount: 1, unit: 'serving' },
              nutrition: {
                calories: Math.round(dinnerCals * 0.7),
                protein: Math.round(proteinGrams * 0.2),
                carbohydrates: Math.round(carbGrams * 0.2),
                fat: Math.round(fatGrams * 0.2)
              }
            },
            {
              name: 'Brown Rice',
              quantity: { amount: 0.5, unit: 'cup' },
              nutrition: {
                calories: Math.round(dinnerCals * 0.3),
                protein: Math.round(proteinGrams * 0.1),
                carbohydrates: Math.round(carbGrams * 0.1),
                fat: Math.round(fatGrams * 0.1)
              }
            }
          ]
        }
      ],
      schedule: {
        mealTiming: [
          { mealType: 'breakfast', time: '8:00 AM', calories: breakfastCals },
          { mealType: 'lunch', time: '12:30 PM', calories: lunchCals },
          { mealType: 'dinner', time: '7:00 PM', calories: dinnerCals },
          { mealType: 'snack', time: '3:00 PM', calories: snackCals }
        ]
      },
      waterIntakeTarget: 2.5,
      workoutNutrition: workoutGoals ? {
        preWorkout: {
          foods: ['Banana with Almond Butter', 'Green Tea'],
          timing: '30-60 minutes before workout',
          notes: 'Focus on easily digestible carbs and moderate protein'
        },
        postWorkout: {
          foods: ['Protein Shake', 'Greek Yogurt with Berries'],
          timing: 'Within 30 minutes after workout',
          notes: 'Prioritize protein for muscle recovery and carbs to replenish glycogen'
        },
        workoutDayAdjustments: 'Add an extra 200-300 calories on workout days',
        restDayAdjustments: 'Maintain regular calorie intake, focus on recovery foods'
      } : null,
      isAIGenerated: false,
      isFallback: true
    };
  }

  // Generate fallback workout plan when AI is not available
  static generateFallbackWorkoutPlan(userProfile, preferences) {
    const duration = parseInt(preferences.workoutDuration) || 45;
    const goal = preferences.goal || userProfile.fitnessGoal || 'general-fitness';
    const difficulty = preferences.experience || 'intermediate';
    const equipment = preferences.equipment || 'bodyweight';

    // Basic exercises based on equipment and goal
    let exercises = [];
    
    if (equipment === 'bodyweight' || equipment === 'minimal') {
      exercises = [
        {
          name: 'Push-ups',
          description: 'Classic bodyweight chest exercise',
          targetMuscles: ['chest', 'shoulders', 'triceps'],
          equipment: 'bodyweight',
          difficulty: 'beginner',
          sets: 3,
          reps: { min: 8, max: 15, target: 12 },
          restTime: 60,
          instructions: [
            'Start in plank position with hands shoulder-width apart',
            'Lower your chest to the ground keeping body straight',
            'Push back up to starting position',
            'Keep core engaged throughout the movement'
          ]
        },
        {
          name: 'Squats',
          description: 'Fundamental lower body exercise',
          targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
          equipment: 'bodyweight',
          difficulty: 'beginner',
          sets: 3,
          reps: { min: 12, max: 20, target: 15 },
          restTime: 60,
          instructions: [
            'Stand with feet shoulder-width apart',
            'Lower down as if sitting back into a chair',
            'Keep chest up and weight in your heels',
            'Return to standing position'
          ]
        },
        {
          name: 'Plank',
          description: 'Core stability exercise',
          targetMuscles: ['core', 'shoulders'],
          equipment: 'bodyweight',
          difficulty: 'beginner',
          sets: 3,
          duration: { min: 30, max: 60, target: 45 },
          restTime: 60,
          instructions: [
            'Hold a push-up position with forearms on ground',
            'Keep body straight from head to heels',
            'Engage core muscles throughout',
            'Breathe normally while holding position'
          ]
        },
        {
          name: 'Lunges',
          description: 'Single-leg strength exercise',
          targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
          equipment: 'bodyweight',
          difficulty: 'intermediate',
          sets: 3,
          reps: { min: 10, max: 16, target: 12 },
          restTime: 60,
          instructions: [
            'Step forward into a lunge position',
            'Lower back knee toward the ground',
            'Keep front knee over ankle',
            'Push back to starting position'
          ]
        }
      ];
    } else if (equipment === 'gym') {
      exercises = [
        {
          name: 'Bench Press',
          description: 'Compound chest exercise',
          targetMuscles: ['chest', 'shoulders', 'triceps'],
          equipment: 'barbell',
          difficulty: 'intermediate',
          sets: 3,
          reps: { min: 8, max: 12, target: 10 },
          restTime: 90,
          instructions: [
            'Lie on bench with feet flat on floor',
            'Grip bar slightly wider than shoulders',
            'Lower bar to chest with control',
            'Press bar back up to starting position'
          ]
        },
        {
          name: 'Deadlift',
          description: 'Full-body compound movement',
          targetMuscles: ['hamstrings', 'glutes', 'back', 'core'],
          equipment: 'barbell',
          difficulty: 'intermediate',
          sets: 3,
          reps: { min: 6, max: 10, target: 8 },
          restTime: 120,
          instructions: [
            'Stand with feet hip-width apart',
            'Grip bar with hands outside legs',
            'Keep back straight and lift by extending hips',
            'Stand tall then lower bar with control'
          ]
        },
        {
          name: 'Squats',
          description: 'Compound lower body exercise',
          targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
          equipment: 'barbell',
          difficulty: 'intermediate',
          sets: 3,
          reps: { min: 8, max: 12, target: 10 },
          restTime: 90,
          instructions: [
            'Position bar on upper back',
            'Stand with feet shoulder-width apart',
            'Squat down keeping chest up',
            'Drive through heels to stand'
          ]
        }
      ];
    }

    return {
      name: `${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Workout Plan`,
      description: `A ${difficulty} level workout plan designed for ${goal.replace('-', ' ')} using ${equipment}`,
      goal: goal,
      difficulty: difficulty,
      duration: duration,
      equipment: equipment,
      workoutType: 'strength',
      exercises: exercises,
      schedule: {
        daysPerWeek: 3,
        programLength: 12,
        restDays: ['Wednesday', 'Saturday', 'Sunday']
      },
      estimatedCaloriesBurn: Math.round(duration * 6), // Rough estimate: 6 calories per minute
      progressionNotes: [
        'Increase reps when you can complete all sets with good form',
        'Add weight or difficulty when exercises become easy',
        'Focus on proper form over speed or weight'
      ],
      isAIGenerated: false,
      isFallback: true
    };
  }
}

module.exports = AIService;