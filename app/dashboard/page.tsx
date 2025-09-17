"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { Calendar, Flame, Target, TrendingUp, Clock, Dumbbell, User, ChevronRight, Play, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"

interface DashboardStats {
  workoutStats: {
    totalSessions: number;
    avgDuration: number;
    totalCalories: number;
  };
  nutritionStats: {
    avgCalories: number;
    avgProtein: number;
  };
  todaysLog?: {
    dailyTotals: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    };
    waterIntake: number;
  };
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<any>(null)

  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long", year: "numeric" })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch multiple data sources in parallel
      const [workoutStatsRes, nutritionStatsRes, nutritionLogRes, activeSessionRes] = await Promise.allSettled([
        api.getWorkoutStats('7d'),
        api.getNutritionStats('7d'),
        api.getNutritionLog(),
        api.getActiveSession()
      ])

      const dashboardStats: DashboardStats = {
        workoutStats: {
          totalSessions: 0,
          avgDuration: 0,
          totalCalories: 0
        },
        nutritionStats: {
          avgCalories: 0,
          avgProtein: 0
        }
      }

      // Process workout stats
      if (workoutStatsRes.status === 'fulfilled' && workoutStatsRes.value.success) {
        const workoutData = workoutStatsRes.value.data.overall
        dashboardStats.workoutStats = {
          totalSessions: workoutData.totalSessions || 0,
          avgDuration: workoutData.avgDuration || 0,
          totalCalories: workoutData.totalCalories || 0
        }
      }

      // Process nutrition stats
      if (nutritionStatsRes.status === 'fulfilled' && nutritionStatsRes.value.success) {
        const nutritionData = nutritionStatsRes.value.data.overall
        dashboardStats.nutritionStats = {
          avgCalories: nutritionData.avgCalories || 0,
          avgProtein: nutritionData.avgProtein || 0
        }
      }

      // Process today's nutrition log
      if (nutritionLogRes.status === 'fulfilled' && nutritionLogRes.value.success) {
        dashboardStats.todaysLog = nutritionLogRes.value.data.log
      }

      // Process active workout session
      if (activeSessionRes.status === 'fulfilled' && activeSessionRes.value.success) {
        setActiveSession(activeSessionRes.value.data.session)
      }

      setStats(dashboardStats)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xl font-bold">Loading Dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Calculate daily goals progress
  const targetCalories = user.nutritionGoals.targetCalories || 2000
  const todaysCalories = stats?.todaysLog?.dailyTotals.calories || 0
  const caloriesProgress = Math.min(100, (todaysCalories / targetCalories) * 100)

  const proteinTarget = Math.round((targetCalories * (user.nutritionGoals.macroRatios.protein / 100)) / 4) // 4 cal per gram
  const todaysProtein = stats?.todaysLog?.dailyTotals.protein || 0
  const proteinProgress = Math.min(100, (todaysProtein / proteinTarget) * 100)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, {user.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {currentMonth}
            </Button>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">
                    {user.profile.age && `Age: ${user.profile.age}`}
                    {user.profile.age && user.profile.weight && ' • '}
                    {user.profile.weight && `Weight: ${user.profile.weight} kg`}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    {user.profile.fitnessGoal?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Fitness'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {user.streak.current}
                </div>
                <div className="text-sm text-muted-foreground">Day streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                Calories Consumed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{Math.round(todaysCalories)}</span>
                  <span className="text-muted-foreground">/ {targetCalories} kcal</span>
                </div>
                <Progress value={caloriesProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">{Math.round(caloriesProgress)}% of daily goal</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-primary" />
                Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats?.workoutStats.totalSessions || 0}</span>
                  <span className="text-muted-foreground">this week</span>
                </div>
                {activeSession ? (
                  <Badge variant="default" className="text-xs">
                    Active Session
                  </Badge>
                ) : (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Ready to start
                    </Badge>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {activeSession ? 'Workout in progress!' : 'Start your next workout'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-accent" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{user.streak.current}</span>
                  <span className="text-muted-foreground">days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (user.streak.current % 7) * (100/7))}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.streak.longest > user.streak.current ? 
                    `Best: ${user.streak.longest} days` : 
                    'New personal best!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </span>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Upper Body Strength</h3>
                <p className="text-sm text-muted-foreground">45 minutes • Intermediate</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">9:00 AM</span>
                <Button size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Cardio Session</h3>
                <p className="text-sm text-muted-foreground">30 minutes • Low intensity</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">6:00 PM</span>
                <Button variant="outline" size="sm">
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/workouts">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Create New Workout
                </Button>
              </Link>
              <Link href="/nutrition">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Plan Today's Meals
                </Button>
              </Link>
              <Link href="/progress">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Workouts Completed</span>
                  <span className="font-semibold">{stats?.workoutStats.totalSessions || 0}/{user.preferences.workoutFrequency || 3}</span>
                </div>
                <Progress 
                  value={Math.min(100, ((stats?.workoutStats.totalSessions || 0) / (user.preferences.workoutFrequency || 3)) * 100)} 
                  className="h-2" 
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Daily Calories</span>
                  <span className="font-semibold">{Math.round(stats?.nutritionStats.avgCalories || 0)}/{targetCalories}</span>
                </div>
                <Progress 
                  value={Math.min(100, ((stats?.nutritionStats.avgCalories || 0) / targetCalories) * 100)} 
                  className="h-2" 
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Protein Intake</span>
                  <span className="font-semibold text-primary">{Math.round(todaysProtein)}g / {proteinTarget}g</span>
                </div>
                <Progress value={proteinProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
