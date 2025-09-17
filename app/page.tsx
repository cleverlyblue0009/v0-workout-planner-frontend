import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Dumbbell, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">FitPlan</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-balance leading-tight">
                Transform Your
                <span className="text-primary block">Fitness Journey</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                AI-powered workout plans, personalized nutrition guidance, and progress tracking to help you achieve
                your fitness goals faster than ever.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Start Your Plan
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50M+</div>
                <div className="text-sm text-muted-foreground">Workouts Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <img
                src="/modern-fitness-app-dashboard-mockup-on-phone-with-.jpg"
                alt="FitPlan App Dashboard"
                className="w-full h-full object-cover rounded-xl shadow-2xl"
              />
            </div>
            {/* Floating cards */}
            <Card className="absolute -top-4 -left-4 p-4 shadow-lg">
              <CardContent className="p-0 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Goal Achieved!</div>
                  <div className="text-sm text-muted-foreground">Lost 5 lbs this month</div>
                </div>
              </CardContent>
            </Card>

            <Card className="absolute -bottom-4 -right-4 p-4 shadow-lg">
              <CardContent className="p-0 flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">Streak: 15 days</div>
                  <div className="text-sm text-muted-foreground">Keep it up!</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-balance">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Comprehensive tools powered by AI to make your fitness journey effective and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI Workout Plans</h3>
                <p className="text-muted-foreground">
                  Personalized workout routines adapted to your fitness level, goals, and available equipment.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Smart Nutrition</h3>
                <p className="text-muted-foreground">
                  AI-generated meal plans with macro tracking to fuel your workouts and recovery.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights to monitor your progress and stay motivated.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-balance">Ready to Transform Your Fitness?</h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Join thousands of users who have already achieved their fitness goals with FitPlan.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-12 py-6">
              Start Your Free Plan Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">FitPlan</span>
          </div>
          <div className="text-sm text-muted-foreground">© 2024 FitPlan. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
