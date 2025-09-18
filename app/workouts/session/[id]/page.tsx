"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { 
  Play, Pause, Square, RotateCcw, ChevronLeft, ChevronRight, 
  Clock, Target, Dumbbell, CheckCircle, X, Timer, Volume2 
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface WorkoutSession {
  _id: string
  name: string
  startTime: string
  duration: number
  exercises: Array<{
    _id: string
    exerciseId: string
    name: string
    sets: Array<{
      setNumber: number
      reps: number
      weight: number
      duration: number
      restTime: number
      completed: boolean
    }>
    completed: boolean
    skipped: boolean
  }>
  completed: boolean
  workoutPlanId: {
    name: string
    description: string
    goal: string
    difficulty: string
  }
}

export default function WorkoutSessionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [currentGuidance, setCurrentGuidance] = useState("")
  const [exerciseTimer, setExerciseTimer] = useState(0)

  // Exercise guidance messages
  const exerciseGuidance = {
    "Squats": [
      "Stand with feet shoulder-width apart",
      "Lower your body by pushing hips back",
      "Keep your chest up and core engaged",
      "Lower until thighs are parallel to floor",
      "Push through heels to return to start"
    ],
    "Push-ups": [
      "Start in plank position, hands under shoulders",
      "Lower your body in a straight line",
      "Keep core tight throughout movement",
      "Push back up to starting position",
      "Maintain proper form over speed"
    ],
    "Lunges": [
      "Step forward with one leg",
      "Lower hips until both knees are 90 degrees",
      "Keep front knee over ankle",
      "Push back to starting position",
      "Alternate legs for each rep"
    ],
    "Plank": [
      "Hold plank position with straight body",
      "Keep core engaged and tight",
      "Don't let hips sag or rise",
      "Breathe steadily throughout",
      "Focus on maintaining form"
    ],
    "Burpees": [
      "Start standing, drop to squat position",
      "Place hands on floor, jump feet back",
      "Perform push-up (optional)",
      "Jump feet back to squat position",
      "Jump up with arms overhead"
    ]
  }

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  // Main workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !isResting) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
        setExerciseTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, isResting])

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false)
            setExerciseTimer(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  // Exercise guidance rotation
  useEffect(() => {
    if (!session || isResting) return

    const currentExercise = session.exercises[currentExerciseIndex]
    if (!currentExercise) return

    const exerciseName = currentExercise.name
    const guidance = exerciseGuidance[exerciseName as keyof typeof exerciseGuidance] || [
      `Perform ${exerciseName} with proper form`,
      "Focus on controlled movements",
      "Maintain steady breathing",
      "Keep core engaged throughout",
      "Quality over quantity"
    ]

    let guidanceIndex = 0
    setCurrentGuidance(guidance[0])

    const interval = setInterval(() => {
      guidanceIndex = (guidanceIndex + 1) % guidance.length
      setCurrentGuidance(guidance[guidanceIndex])
    }, 5000) // Change guidance every 5 seconds

    return () => clearInterval(interval)
  }, [currentExerciseIndex, session, isResting, exerciseTimer])

  const loadSession = async () => {
    try {
      setLoading(true)
      const response = await api.getWorkoutSession(sessionId)
      if (response.success) {
        setSession(response.data.session)
        setIsTimerRunning(true) // Auto-start timer when session loads
      } else {
        toast.error("Session not found")
        router.push('/workouts')
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      toast.error("Failed to load workout session")
      router.push('/workouts')
    } finally {
      setLoading(false)
    }
  }

  const completeSet = async () => {
    if (!session) return

    const updatedSession = { ...session }
    const currentExercise = updatedSession.exercises[currentExerciseIndex]
    const currentSet = currentExercise.sets[currentSetIndex]
    
    // Mark set as completed
    currentSet.completed = true

    // Start rest timer if not the last set
    if (currentSetIndex < currentExercise.sets.length - 1) {
      setRestTimer(currentSet.restTime || 60)
      setIsResting(true)
      setCurrentGuidance(`Rest for ${currentSet.restTime || 60} seconds`)
    }

    // Move to next set or exercise
    if (currentSetIndex < currentExercise.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1)
    } else {
      // Mark exercise as completed
      currentExercise.completed = true
      
      // Move to next exercise
      if (currentExerciseIndex < updatedSession.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCurrentSetIndex(0)
        setExerciseTimer(0)
      } else {
        // All exercises completed
        completeWorkout()
        return
      }
    }

    setSession(updatedSession)

    // Update session on server
    try {
      await api.updateWorkoutSession(sessionId, {
        exercises: updatedSession.exercises
      })
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }

  const skipSet = () => {
    if (!session) return

    // Move to next set or exercise without marking as completed
    const currentExercise = session.exercises[currentExerciseIndex]
    
    if (currentSetIndex < currentExercise.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1)
    } else {
      // Move to next exercise
      if (currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCurrentSetIndex(0)
        setExerciseTimer(0)
      }
    }
  }

  const completeWorkout = async () => {
    if (!session) return

    try {
      await api.completeWorkoutSession(sessionId, {
        rating: 5, // Default rating, could be made interactive
        notes: "Workout completed successfully"
      })
      
      toast.success("Workout completed! Great job!")
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to complete workout:', error)
      toast.error("Failed to complete workout")
    }
  }

  const pauseWorkout = () => {
    setIsTimerRunning(false)
  }

  const resumeWorkout = () => {
    setIsTimerRunning(true)
  }

  const endWorkout = async () => {
    if (!session) return

    try {
      await api.completeWorkoutSession(sessionId, {
        rating: 3,
        notes: "Workout ended early"
      })
      
      toast.success("Workout ended")
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to end workout:', error)
      toast.error("Failed to end workout")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateProgress = () => {
    if (!session) return 0
    
    const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
    const completedSets = session.exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.completed).length, 0)
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading workout session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
          <Link href="/workouts">
            <Button>Back to Workouts</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentExercise = session.exercises[currentExerciseIndex]
  const currentSet = currentExercise?.sets[currentSetIndex]
  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workouts">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{session.name}</h1>
              <p className="text-sm text-muted-foreground">
                {session.workoutPlanId?.difficulty} • {formatTime(timeElapsed)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isTimerRunning ? (
              <Button variant="outline" size="sm" onClick={pauseWorkout}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={resumeWorkout}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            
            <Button variant="destructive" size="sm" onClick={endWorkout}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Workout Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{currentExerciseIndex + 1}</div>
                  <div className="text-sm text-muted-foreground">of {session.exercises.length} exercises</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{currentSetIndex + 1}</div>
                  <div className="text-sm text-muted-foreground">of {currentExercise?.sets.length || 0} sets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-muted-foreground">elapsed time</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Exercise */}
        {currentExercise && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                {currentExercise.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rest Timer */}
              {isResting ? (
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">{formatTime(restTimer)}</div>
                  <div className="text-lg font-medium">Rest Time</div>
                  <div className="text-muted-foreground">{currentGuidance}</div>
                  <Button 
                    onClick={() => {
                      setIsResting(false)
                      setRestTimer(0)
                      setExerciseTimer(0)
                    }}
                    variant="outline"
                  >
                    Skip Rest
                  </Button>
                </div>
              ) : (
                <>
                  {/* AI Guidance */}
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-primary">
                      {currentGuidance}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      <span>{formatTime(exerciseTimer)}</span>
                    </div>
                  </div>

                  {/* Current Set Info */}
                  {currentSet && (
                    <div className="bg-card rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Set {currentSet.setNumber}</span>
                        <Badge variant={currentSet.completed ? "default" : "secondary"}>
                          {currentSet.completed ? "Completed" : "Current"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {currentSet.reps > 0 && (
                          <div>
                            <span className="text-muted-foreground">Reps: </span>
                            <span className="font-medium">{currentSet.reps}</span>
                          </div>
                        )}
                        {currentSet.weight > 0 && (
                          <div>
                            <span className="text-muted-foreground">Weight: </span>
                            <span className="font-medium">{currentSet.weight} kg</span>
                          </div>
                        )}
                        {currentSet.duration > 0 && (
                          <div>
                            <span className="text-muted-foreground">Duration: </span>
                            <span className="font-medium">{currentSet.duration}s</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Rest: </span>
                          <span className="font-medium">{currentSet.restTime}s</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1" 
                      size="lg"
                      onClick={completeSet}
                      disabled={currentSet?.completed}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {currentSet?.completed ? "Completed" : "Complete Set"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={skipSet}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {session.exercises.map((exercise, index) => (
                <div 
                  key={exercise._id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === currentExerciseIndex 
                      ? "bg-primary/10 border border-primary/20" 
                      : exercise.completed 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {exercise.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : index === currentExerciseIndex ? (
                      <div className="w-5 h-5 bg-primary rounded-full" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.sets.length} sets • {exercise.sets.filter(s => s.completed).length} completed
                      </div>
                    </div>
                  </div>
                  
                  {index === currentExerciseIndex && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  )
}