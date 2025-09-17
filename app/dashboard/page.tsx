import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { Calendar, Flame, Target, TrendingUp, Clock, Dumbbell, User, ChevronRight, Play } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, Alex!</h1>
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
                  <h2 className="text-xl font-semibold">Alex Johnson</h2>
                  <p className="text-muted-foreground">Age: 28 • Weight: 165 lbs</p>
                  <Badge variant="secondary" className="mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    Weight Loss Goal
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">-12 lbs</div>
                <div className="text-sm text-muted-foreground">Progress so far</div>
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
                Calories Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">420</span>
                  <span className="text-muted-foreground">/ 500 kcal</span>
                </div>
                <Progress value={84} className="h-2" />
                <p className="text-sm text-muted-foreground">84% of daily goal</p>
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
                  <span className="text-3xl font-bold">2</span>
                  <span className="text-muted-foreground">completed today</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Upper Body
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Cardio
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Great job staying active!</p>
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
                  <span className="text-3xl font-bold">15</span>
                  <span className="text-muted-foreground">days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-sm text-muted-foreground">5 days to next milestone</p>
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
                  <span className="font-semibold">8/10</span>
                </div>
                <Progress value={80} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Calories Goal</span>
                  <span className="font-semibold">2,840/3,500</span>
                </div>
                <Progress value={81} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Weight Progress</span>
                  <span className="font-semibold text-primary">-2.3 lbs</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
