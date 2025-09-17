"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Dumbbell, Clock, Target, Zap, RefreshCw, Play, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

export default function WorkoutsPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    goal: "",
    equipment: "",
    timePerDay: "",
    workoutStyle: "",
    experience: "",
  })

  useEffect(() => {
    loadExistingPlans()
  }, [])

  const loadExistingPlans = async () => {
    try {
      setIsLoading(true)
      const response = await api.getWorkoutPlans({ limit: 1 })
      if (response.success && response.data.plans.length > 0) {
        setWorkoutPlan(response.data.plans[0])
        setGeneratedPlan(true)
      }
    } catch (error) {
      console.error('Error loading workout plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!formData.goal || !formData.equipment || !formData.timePerDay || !formData.workoutStyle || !formData.experience) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setIsGenerating(true)
      
      // Update user profile with workout preferences
      await api.updateProfile({
        preferences: {
          ...user?.preferences,
          equipment: formData.equipment,
          workoutStyle: formData.workoutStyle,
          workoutDuration: formData.timePerDay,
          workoutFrequency: 5 // Default frequency
        },
        profile: {
          ...user?.profile,
          fitnessGoal: formData.goal
        }
      })

      // Generate AI workout plan
      const response = await api.generateWorkoutPlan({
        goal: formData.goal,
        experience: formData.experience,
        equipment: formData.equipment,
        timePerDay: formData.timePerDay,
        workoutStyle: formData.workoutStyle
      })

      if (response.success) {
        setWorkoutPlan(response.data.workoutPlan)
        setGeneratedPlan(true)
        setShowForm(false)
        toast.success("Workout plan generated successfully!")
      } else {
        toast.error("Failed to generate workout plan")
      }
    } catch (error) {
      console.error('Error generating workout plan:', error)
      toast.error("Failed to generate workout plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegeneratePlan = () => {
    setGeneratedPlan(false)
    setShowForm(true)
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="bg-card border-b px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Your Workout Plan</h1>
              <p className="text-muted-foreground">Tell us about your goals and preferences</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Workout Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                      <SelectItem value="strength">Build Strength</SelectItem>
                      <SelectItem value="endurance">Improve Endurance</SelectItem>
                      <SelectItem value="general-fitness">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Available Equipment</Label>
                  <Select
                    value={formData.equipment}
                    onValueChange={(value) => setFormData({ ...formData, equipment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What equipment do you have?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-gym">Full Gym Access</SelectItem>
                      <SelectItem value="home-basic">Basic Home Equipment</SelectItem>
                      <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                      <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
                      <SelectItem value="resistance-bands">Resistance Bands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time Per Workout</Label>
                  <Select
                    value={formData.timePerDay}
                    onValueChange={(value) => setFormData({ ...formData, timePerDay: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How long can you workout?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15-30">15-30 minutes</SelectItem>
                      <SelectItem value="30-45">30-45 minutes</SelectItem>
                      <SelectItem value="45-60">45-60 minutes</SelectItem>
                      <SelectItem value="60+">60+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Preferred Workout Style</Label>
                <Select
                  value={formData.workoutStyle}
                  onValueChange={(value) => setFormData({ ...formData, workoutStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your preferred style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength-training">Strength Training</SelectItem>
                    <SelectItem value="hiit">High-Intensity Interval Training (HIIT)</SelectItem>
                    <SelectItem value="cardio">Cardio Focused</SelectItem>
                    <SelectItem value="yoga-pilates">Yoga & Pilates</SelectItem>
                    <SelectItem value="mixed">Mixed Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGeneratePlan} 
                className="w-full" 
                size="lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating Plan...' : 'Generate My AI Workout Plan'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Navigation />
      </div>
    )
  }

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="bg-card border-b px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your AI-Generated Workout Plan</h1>
              <p className="text-muted-foreground">Personalized for weight loss • Intermediate level</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRegeneratePlan}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button>Save Plan</Button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Plan Overview */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5</div>
                  <div className="text-sm text-muted-foreground">Days per week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">45</div>
                  <div className="text-sm text-muted-foreground">Minutes per session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Week program</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">400+</div>
                  <div className="text-sm text-muted-foreground">Calories per workout</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>This Week's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { day: "Monday", workout: "Upper Body Strength", duration: "45 min", completed: true },
                  { day: "Tuesday", workout: "HIIT Cardio", duration: "30 min", completed: true },
                  { day: "Wednesday", workout: "Lower Body Strength", duration: "45 min", completed: false },
                  { day: "Thursday", workout: "Active Recovery", duration: "20 min", completed: false },
                  { day: "Friday", workout: "Full Body Circuit", duration: "40 min", completed: false },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.completed ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                      )}
                      <div>
                        <div className="font-medium">{item.day}</div>
                        <div className="text-sm text-muted-foreground">{item.workout}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.duration}</span>
                      {!item.completed && (
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Workout: Lower Body Strength</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">Intermediate</Badge>
                  <Badge variant="outline">45 minutes</Badge>
                  <Badge variant="outline">Lower Body</Badge>
                </div>

                <div className="space-y-3">
                  {[
                    { exercise: "Squats", sets: "4 sets", reps: "12-15 reps", rest: "60s" },
                    { exercise: "Romanian Deadlifts", sets: "3 sets", reps: "10-12 reps", rest: "90s" },
                    { exercise: "Bulgarian Split Squats", sets: "3 sets", reps: "10 each leg", rest: "60s" },
                    { exercise: "Hip Thrusts", sets: "3 sets", reps: "12-15 reps", rest: "60s" },
                    { exercise: "Calf Raises", sets: "3 sets", reps: "15-20 reps", rest: "45s" },
                  ].map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{exercise.exercise}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets} • {exercise.reps}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Rest: {exercise.rest}</div>
                    </div>
                  ))}
                </div>

                <Button className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Workout Library */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Upper Body Blast",
                    duration: "40 min",
                    difficulty: "Intermediate",
                    type: "Strength",
                    color: "bg-primary/10 border-primary/20",
                  },
                  {
                    name: "HIIT Cardio Burn",
                    duration: "25 min",
                    difficulty: "Advanced",
                    type: "Cardio",
                    color: "bg-accent/10 border-accent/20",
                  },
                  {
                    name: "Core & Stability",
                    duration: "30 min",
                    difficulty: "Beginner",
                    type: "Core",
                    color: "bg-secondary/10 border-secondary/20",
                  },
                ].map((workout, index) => (
                  <Card key={index} className={workout.color}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{workout.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {workout.duration} • {workout.difficulty}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {workout.type}
                        </Badge>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Navigation />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading workout plans...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workout Planner</h1>
            <p className="text-muted-foreground">Create personalized workout plans with AI</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Create New Plan CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready for a New Challenge?</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Let our AI create a personalized workout plan tailored to your goals, equipment, and schedule.
                </p>
              </div>
              <Button size="lg" onClick={() => setShowForm(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Create AI Workout Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Workouts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Quick Upper Body</h3>
                  <p className="text-sm text-muted-foreground">20 minutes • No equipment needed</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Beginner
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Strength
                  </Badge>
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">HIIT Cardio Blast</h3>
                  <p className="text-sm text-muted-foreground">15 minutes • High intensity</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Intermediate
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Cardio
                  </Badge>
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Core Strength</h3>
                  <p className="text-sm text-muted-foreground">25 minutes • Mat required</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    All Levels
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Core
                  </Badge>
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
