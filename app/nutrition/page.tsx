"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { Target, Clock, Utensils, Plus, RefreshCw, ArrowLeft, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface NutritionGoals {
  targetCalories: number
  macroRatios: {
    protein: number
    carbs: number
    fats: number
  }
}

interface NutritionLog {
  dailyTotals: {
    calories: number
    protein: number
    carbohydrates: number
    fat: number
  }
  waterIntake: number
  meals: Array<{
    mealType: string
    time: string
    foods: Array<{
      name: string
      quantity: { amount: number; unit: string }
      nutrition: {
        calories: number
        protein: number
        carbohydrates: number
        fat: number
      }
    }>
    totalNutrition: {
      calories: number
      protein: number
      carbohydrates: number
      fat: number
    }
  }>
}

interface NutritionPlan {
  name: string
  targetCalories: number
  macroTargets: {
    protein: { grams: number; percentage: number }
    carbohydrates: { grams: number; percentage: number }
    fat: { grams: number; percentage: number }
  }
  meals: Array<{
    name: string
    type: string
    totalNutrition: {
      calories: number
      protein: number
      carbohydrates: number
      fat: number
    }
    foods: Array<{
      name: string
      quantity: { amount: number; unit: string }
      nutrition: {
        calories: number
        protein: number
        carbohydrates: number
        fat: number
      }
    }>
  }>
  schedule: {
    mealTiming: Array<{
      mealType: string
      time: string
      calories: number
    }>
  }
  waterIntakeTarget: number
}

export default function NutritionPage() {
  const { user } = useAuth()
  const [selectedDay, setSelectedDay] = useState("today")
  const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null)
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)

  useEffect(() => {
    loadNutritionData()
  }, [selectedDay])

  const loadNutritionData = async () => {
    try {
      setIsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Load nutrition log for today
      const logResponse = await api.getNutritionLog(today)
      if (logResponse.success) {
        setNutritionLog((logResponse.data as any)?.log)
        setNutritionGoals((logResponse.data as any)?.goals)
      }

      // Try to get existing nutrition plan
      const plansResponse = await api.getNutritionPlans({ limit: 1 })
      if (plansResponse.success && (plansResponse.data as any)?.plans?.length > 0) {
        setNutritionPlan((plansResponse.data as any).plans[0])
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error)
      toast.error('Failed to load nutrition data')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to map fitness goals to nutrition goals
  const mapFitnessGoalToNutritionGoal = (fitnessGoal: string | undefined): string => {
    const goalMapping: { [key: string]: string } = {
      'weight-loss': 'weight-loss',
      'weight-gain': 'weight-gain',
      'muscle-gain': 'muscle-gain',
      'strength': 'muscle-gain',
      'endurance': 'maintenance',
      'general-fitness': 'maintenance',
      'maintenance': 'maintenance'
    }
    return goalMapping[fitnessGoal || 'general-fitness'] || 'maintenance'
  }

  const generateNewNutritionPlan = async () => {
    try {
      setIsGeneratingPlan(true)
      
      // Get user location for regional food preferences
      let location = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
          })
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          toast.success('Location detected for personalized meal suggestions!')
        } catch (error) {
          console.log('Location not available, using default preferences')
          toast.info('Using default regional preferences (location not available)')
        }
      }

      // Get current workout plans to inform nutrition planning
      let workoutGoals = null
      try {
        const workoutResponse = await api.getWorkoutPlans({ limit: 1 })
        if (workoutResponse.success && (workoutResponse.data as any)?.plans?.length > 0) {
          const plan = (workoutResponse.data as any).plans[0]
          workoutGoals = {
            goal: plan.goal,
            difficulty: plan.difficulty,
            duration: plan.duration,
            workoutType: plan.workoutType,
            estimatedCaloriesBurn: plan.estimatedCaloriesBurn
          }
        }
      } catch (error) {
        console.log('No workout plans found, using profile goals')
      }

      // Determine nutrition goal from user's fitness goal
      const nutritionGoal = mapFitnessGoalToNutritionGoal(user?.profile?.fitnessGoal)

      const response = await api.generateNutritionPlan({ 
        goal: nutritionGoal,
        location,
        workoutGoals,
        includeWorkoutNutrition: true
      })
      
      if (response.success) {
        setNutritionPlan((response.data as any)?.nutritionPlan)
        toast.success('Personalized nutrition plan generated based on your location and workout goals!')
        // Reload nutrition data
        await loadNutritionData()
      } else {
        toast.error('Failed to generate nutrition plan')
      }
    } catch (error) {
      console.error('Error generating nutrition plan:', error)
      toast.error('Failed to generate nutrition plan. Please try again.')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading nutrition data...</span>
        </div>
      </div>
    )
  }

  // Calculate macro percentages
  const calculateMacroData = () => {
    if (!nutritionLog || !nutritionGoals) {
      return {
        calories: { current: 0, target: 2000, percentage: 0 },
        protein: { current: 0, target: 150, percentage: 0 },
        carbs: { current: 0, target: 220, percentage: 0 },
        fats: { current: 0, target: 70, percentage: 0 },
      }
    }

    const targetProtein = (nutritionGoals.targetCalories * nutritionGoals.macroRatios.protein / 100) / 4
    const targetCarbs = (nutritionGoals.targetCalories * nutritionGoals.macroRatios.carbs / 100) / 4
    const targetFats = (nutritionGoals.targetCalories * nutritionGoals.macroRatios.fats / 100) / 9

    return {
      calories: {
        current: Math.round(nutritionLog.dailyTotals.calories),
        target: nutritionGoals.targetCalories,
        percentage: Math.round((nutritionLog.dailyTotals.calories / nutritionGoals.targetCalories) * 100)
      },
      protein: {
        current: Math.round(nutritionLog.dailyTotals.protein),
        target: Math.round(targetProtein),
        percentage: Math.round((nutritionLog.dailyTotals.protein / targetProtein) * 100)
      },
      carbs: {
        current: Math.round(nutritionLog.dailyTotals.carbohydrates),
        target: Math.round(targetCarbs),
        percentage: Math.round((nutritionLog.dailyTotals.carbohydrates / targetCarbs) * 100)
      },
      fats: {
        current: Math.round(nutritionLog.dailyTotals.fat),
        target: Math.round(targetFats),
        percentage: Math.round((nutritionLog.dailyTotals.fat / targetFats) * 100)
      }
    }
  }

  const macroData = calculateMacroData()

  // Convert nutrition plan to meal plan format
  const getMealPlan = () => {
    if (!nutritionPlan) return []

    return nutritionPlan.meals.map(meal => ({
      meal: meal.name,
      time: nutritionPlan.schedule.mealTiming.find(t => t.mealType === meal.type)?.time || '12:00 PM',
      calories: meal.totalNutrition.calories,
      items: meal.foods.map(food => ({
        name: food.name,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein
      }))
    }))
  }

  const mealPlan = getMealPlan()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nutrition Planner</h1>
            <p className="text-muted-foreground">AI-powered meal suggestions for your fitness goals</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={generateNewNutritionPlan}
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPlan ? 'Generating...' : 'Generate New Plan'}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Daily Macros Overview */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Today's Nutrition Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-muted-foreground">
                    {macroData.calories.current}/{macroData.calories.target}
                  </span>
                </div>
                <Progress value={macroData.calories.percentage} className="h-3" />
                <div className="text-xs text-muted-foreground">{macroData.calories.percentage}% of goal</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">
                    {macroData.protein.current}g/{macroData.protein.target}g
                  </span>
                </div>
                <Progress value={macroData.protein.percentage} className="h-3" />
                <div className="text-xs text-muted-foreground">{macroData.protein.percentage}% of goal</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">
                    {macroData.carbs.current}g/{macroData.carbs.target}g
                  </span>
                </div>
                <Progress value={macroData.carbs.percentage} className="h-3" />
                <div className="text-xs text-muted-foreground">{macroData.carbs.percentage}% of goal</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fats</span>
                  <span className="text-sm text-muted-foreground">
                    {macroData.fats.current}g/{macroData.fats.target}g
                  </span>
                </div>
                <Progress value={macroData.fats.percentage} className="h-3" />
                <div className="text-xs text-muted-foreground">{macroData.fats.percentage}% of goal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today's Meal Plan</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Yesterday
                </Button>
                <Button size="sm">Today</Button>
                <Button variant="outline" size="sm">
                  Tomorrow
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {mealPlan.length === 0 ? (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Utensils className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Meal Plan Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate an AI-powered nutrition plan tailored to your goals and location.
                    </p>
                    <Button 
                      onClick={generateNewNutritionPlan}
                      disabled={isGeneratingPlan}
                      className="w-full"
                    >
                      {isGeneratingPlan ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {isGeneratingPlan ? 'Generating...' : 'Generate Meal Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mealPlan.map((meal, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Utensils className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{meal.meal}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {meal.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{meal.calories}</div>
                        <div className="text-xs text-muted-foreground">calories</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {meal.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{item.calories} cal</span>
                            <span>{item.protein}g protein</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Food
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Calories</span>
                  <span className="font-semibold">{macroData.calories.current.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Meals Planned</span>
                  <span className="font-semibold">{mealPlan.length}/{nutritionPlan?.schedule?.mealTiming?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Protein Goal</span>
                  <span className="font-semibold text-primary">{macroData.protein.percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Water Intake</span>
                  <span className="font-semibold">
                    {nutritionLog?.waterIntake || 0}/{nutritionPlan?.waterIntakeTarget || 8} glasses
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Meal Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Alternatives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nutritionPlan ? (
                  <>
                    <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <div className="font-medium text-sm">High-Protein Option</div>
                      <div className="text-xs text-muted-foreground">Based on your goals</div>
                      <div className="text-xs text-accent font-medium">
                        {Math.round(macroData.protein.target * 0.3)} cal • {Math.round(macroData.protein.target * 0.2)}g protein
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="font-medium text-sm">Balanced Meal</div>
                      <div className="text-xs text-muted-foreground">Matches your macro targets</div>
                      <div className="text-xs text-primary font-medium">
                        {Math.round(macroData.calories.target * 0.25)} cal • {Math.round(macroData.protein.target * 0.25)}g protein
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                      <div className="font-medium text-sm">Pre-Workout Fuel</div>
                      <div className="text-xs text-muted-foreground">Quick energy boost</div>
                      <div className="text-xs text-secondary-foreground font-medium">
                        {Math.round(macroData.carbs.target * 0.4)} cal • {Math.round(macroData.carbs.target * 0.3)}g carbs
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Generate a nutrition plan to see personalized suggestions</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-transparent"
                  onClick={generateNewNutritionPlan}
                  disabled={isGeneratingPlan}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {nutritionPlan ? 'Get More Suggestions' : 'Generate Plan'}
                </Button>
              </CardContent>
            </Card>

            {/* Nutrition Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pre-Workout Fuel</h3>
                    <p className="text-sm text-muted-foreground">
                      Eat a small snack with carbs and protein 30-60 minutes before your workout for optimal energy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
