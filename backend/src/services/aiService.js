const { openai, WORKOUT_SYSTEM_PROMPT, NUTRITION_SYSTEM_PROMPT, PROGRESS_SYSTEM_PROMPT } = require('../config/openai');
const LocationService = require('./locationService');

class AIService {
  // Generate personalized workout plan
  static async generateWorkoutPlan(userProfile, preferences) {
    try {
      const prompt = this.buildWorkoutPrompt(userProfile, preferences);
      
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
      return workoutPlan;
    } catch (error) {
      console.error('AI workout generation error:', error);
      throw new Error('Failed to generate workout plan');
    }
  }

  // Generate personalized nutrition plan
  static async generateNutritionPlan(userProfile, preferences, nutritionGoals, location = null, workoutGoals = null) {
    try {
      const prompt = this.buildNutritionPrompt(userProfile, preferences, nutritionGoals, location, workoutGoals);
      
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
      return nutritionPlan;
    } catch (error) {
      console.error('AI nutrition generation error:', error);
      throw new Error('Failed to generate nutrition plan');
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
}

module.exports = AIService;