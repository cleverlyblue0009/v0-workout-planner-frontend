"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { TrendingUp, Award, Target, ArrowLeft, Trophy, Flame, Dumbbell } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function ProgressPage() {
  const weightData = [
    { date: "Jan 1", weight: 175 },
    { date: "Jan 8", weight: 174 },
    { date: "Jan 15", weight: 172 },
    { date: "Jan 22", weight: 171 },
    { date: "Jan 29", weight: 169 },
    { date: "Feb 5", weight: 168 },
    { date: "Feb 12", weight: 166 },
    { date: "Feb 19", weight: 165 },
    { date: "Feb 26", weight: 163 },
  ]

  const workoutData = [
    { week: "Week 1", workouts: 3, calories: 1200 },
    { week: "Week 2", workouts: 4, calories: 1600 },
    { week: "Week 3", workouts: 5, calories: 2000 },
    { week: "Week 4", workouts: 4, calories: 1800 },
    { week: "Week 5", workouts: 5, calories: 2200 },
    { week: "Week 6", workouts: 6, calories: 2400 },
    { week: "Week 7", workouts: 5, calories: 2100 },
    { week: "Week 8", workouts: 6, calories: 2500 },
  ]

  const achievements = [
    {
      title: "First Week Complete",
      description: "Completed your first week of workouts",
      date: "2 months ago",
      icon: Trophy,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "10 Workouts Milestone",
      description: "Reached 10 completed workouts",
      date: "6 weeks ago",
      icon: Dumbbell,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "5 Pound Loss",
      description: "Lost your first 5 pounds",
      date: "4 weeks ago",
      icon: TrendingUp,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Consistency Champion",
      description: "Worked out 5 days in a row",
      date: "2 weeks ago",
      icon: Flame,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Goal Crusher",
      description: "Reached 50% of your weight loss goal",
      date: "1 week ago",
      icon: Target,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Progress Tracking</h1>
            <p className="text-muted-foreground">Monitor your fitness journey and celebrate achievements</p>
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
        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">-12 lbs</div>
                  <div className="text-sm text-muted-foreground">Weight Lost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">48</div>
                  <div className="text-sm text-muted-foreground">Workouts Done</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">15,240</div>
                  <div className="text-sm text-muted-foreground">Calories Burned</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weight Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Starting: 175 lbs</div>
                <div className="text-muted-foreground">Current: 163 lbs</div>
                <div className="text-primary font-semibold">Goal: 155 lbs</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">Average: 4.8 workouts per week</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{achievement.date}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Streaks and Goals */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Current Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <div className="font-semibold">Workout Streak</div>
                  <div className="text-sm text-muted-foreground">Consecutive workout days</div>
                </div>
                <div className="text-2xl font-bold text-primary">15 days</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <div>
                  <div className="font-semibold">Nutrition Tracking</div>
                  <div className="text-sm text-muted-foreground">Days logging meals</div>
                </div>
                <div className="text-2xl font-bold text-accent">23 days</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <div className="font-semibold">Weekly Goal</div>
                  <div className="text-sm text-muted-foreground">Weeks hitting target</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">8 weeks</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Weight Loss Goal</span>
                  <span className="text-sm text-muted-foreground">12/20 lbs</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <div className="text-xs text-muted-foreground">60% complete</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Workout Frequency</span>
                  <span className="text-sm text-muted-foreground">48/60 workouts</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-accent h-3 rounded-full" style={{ width: "80%" }}></div>
                </div>
                <div className="text-xs text-muted-foreground">80% complete</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Strength Improvement</span>
                  <span className="text-sm text-muted-foreground">7/10 milestones</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: "70%" }}></div>
                </div>
                <div className="text-xs text-muted-foreground">70% complete</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
