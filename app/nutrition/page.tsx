"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { Target, Clock, Utensils, Plus, RefreshCw, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"

export default function NutritionPage() {
  const [selectedDay, setSelectedDay] = useState("today")

  const macroData = {
    calories: { current: 1650, target: 2000, percentage: 83 },
    protein: { current: 120, target: 150, percentage: 80 },
    carbs: { current: 180, target: 220, percentage: 82 },
    fats: { current: 55, target: 70, percentage: 79 },
  }

  const mealPlan = [
    {
      meal: "Breakfast",
      time: "7:00 AM",
      calories: 420,
      items: [
        { name: "Greek Yogurt with Berries", calories: 180, protein: 15 },
        { name: "Granola", calories: 140, protein: 4 },
        { name: "Banana", calories: 100, protein: 1 },
      ],
    },
    {
      meal: "Lunch",
      time: "12:30 PM",
      calories: 520,
      items: [
        { name: "Grilled Chicken Salad", calories: 320, protein: 35 },
        { name: "Quinoa", calories: 120, protein: 4 },
        { name: "Avocado", calories: 80, protein: 1 },
      ],
    },
    {
      meal: "Snack",
      time: "3:30 PM",
      calories: 180,
      items: [{ name: "Protein Smoothie", calories: 180, protein: 25 }],
    },
    {
      meal: "Dinner",
      time: "7:00 PM",
      calories: 530,
      items: [
        { name: "Salmon Fillet", calories: 280, protein: 40 },
        { name: "Sweet Potato", calories: 150, protein: 3 },
        { name: "Steamed Broccoli", calories: 100, protein: 5 },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nutrition Planner</h1>
            <p className="text-muted-foreground">AI-powered meal suggestions for your fitness goals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Plan
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
              {mealPlan.map((meal, index) => (
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
              ))}
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
                  <span className="font-semibold">1,650</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Meals Planned</span>
                  <span className="font-semibold">4/4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Protein Goal</span>
                  <span className="font-semibold text-primary">80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Water Intake</span>
                  <span className="font-semibold">6/8 glasses</span>
                </div>
              </CardContent>
            </Card>

            {/* Meal Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Alternatives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="font-medium text-sm">High-Protein Breakfast</div>
                  <div className="text-xs text-muted-foreground">Scrambled eggs with spinach</div>
                  <div className="text-xs text-accent font-medium">380 cal • 28g protein</div>
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="font-medium text-sm">Light Lunch Option</div>
                  <div className="text-xs text-muted-foreground">Turkey and veggie wrap</div>
                  <div className="text-xs text-primary font-medium">420 cal • 25g protein</div>
                </div>

                <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <div className="font-medium text-sm">Post-Workout Snack</div>
                  <div className="text-xs text-muted-foreground">Chocolate protein shake</div>
                  <div className="text-xs text-secondary-foreground font-medium">200 cal • 30g protein</div>
                </div>

                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Zap className="h-3 w-3 mr-1" />
                  Get More Suggestions
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
