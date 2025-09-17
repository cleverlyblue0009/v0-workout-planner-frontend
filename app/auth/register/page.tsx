"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { DevConfigChecker } from '@/components/DevConfigChecker';
import { Dumbbell, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Profile
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: '',
    fitnessGoal: '',
    
    // Step 3: Preferences
    equipment: '',
    workoutStyle: '',
    workoutDuration: '',
    workoutFrequency: '',
    dietaryRestrictions: [] as string[],
    allergies: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, setupProfile, signInWithGoogleAuth } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      // Validate current step and move to next
      if (validateStep(step)) {
        setStep(step + 1);
        setError('');
      }
      return;
    }

    // Final submission
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Step 1: Create Firebase user
      const signUpSuccess = await signUp(formData.email, formData.password, formData.name);
      
      if (!signUpSuccess) {
        setError('Failed to create account. Please try again.');
        return;
      }

      // Step 2: Setup profile with collected data
      const profileData = {
        name: formData.name,
        profile: {
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender || undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
          activityLevel: formData.activityLevel || undefined,
          fitnessGoal: formData.fitnessGoal || undefined
        },
        preferences: {
          equipment: formData.equipment || undefined,
          workoutStyle: formData.workoutStyle || undefined,
          workoutDuration: formData.workoutDuration || undefined,
          workoutFrequency: formData.workoutFrequency ? parseInt(formData.workoutFrequency) : undefined,
          dietaryRestrictions: formData.dietaryRestrictions,
          allergies: formData.allergies
        }
      };

      const profileSuccess = await setupProfile(profileData);
      
      if (profileSuccess) {
        router.push('/dashboard');
      } else {
        // Profile setup failed but user is created - redirect to dashboard anyway
        // They can complete profile setup later
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases with helpful messages
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.message?.includes('Firebase configuration is incomplete')) {
        setError('Application is not properly configured. Please check the console for details.');
      } else if (error.message?.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(`Registration failed: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const success = await signInWithGoogleAuth();
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Google sign up failed');
      }
    } catch (error: any) {
      console.error('Google sign up error:', error);
      
      // Handle specific Google sign-in errors
      if (error.message?.includes('Firebase configuration is incomplete')) {
        setError('Application is not properly configured. Please check the console for details.');
      } else if (error.message?.includes('popup')) {
        setError(error.message);
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError(`Google sign up failed: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 2:
        // Profile step is optional but we can add validation if needed
        break;
      default:
        return true;
    }
    return true;
  };

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleArrayChange = (name: string, value: string, checked: boolean) => {
    const currentArray = formData[name as keyof typeof formData] as string[];
    if (checked) {
      handleChange(name, [...currentArray, value].join(','));
    } else {
      handleChange(name, currentArray.filter(item => item !== value).join(','));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Full Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            min="13"
            max="120"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="25"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="height" className="text-sm font-medium">Height (cm)</label>
          <input
            id="height"
            name="height"
            type="number"
            min="100"
            max="250"
            value={formData.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="170"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="weight" className="text-sm font-medium">Weight (kg)</label>
          <input
            id="weight"
            name="weight"
            type="number"
            min="30"
            max="500"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="70"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="targetWeight" className="text-sm font-medium">Target Weight (kg)</label>
        <input
          id="targetWeight"
          name="targetWeight"
          type="number"
          min="30"
          max="500"
          step="0.1"
          value={formData.targetWeight}
          onChange={(e) => handleChange('targetWeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="65"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Activity Level</label>
        <Select value={formData.activityLevel} onValueChange={(value) => handleChange('activityLevel', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your activity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
            <SelectItem value="lightly-active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
            <SelectItem value="moderately-active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
            <SelectItem value="very-active">Very Active (hard exercise 6-7 days/week)</SelectItem>
            <SelectItem value="extremely-active">Extremely Active (very hard exercise/sports)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fitness Goal</label>
        <Select value={formData.fitnessGoal} onValueChange={(value) => handleChange('fitnessGoal', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your primary goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight-loss">Weight Loss</SelectItem>
            <SelectItem value="weight-gain">Weight Gain</SelectItem>
            <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
            <SelectItem value="strength">Build Strength</SelectItem>
            <SelectItem value="endurance">Improve Endurance</SelectItem>
            <SelectItem value="general-fitness">General Fitness</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Available Equipment</label>
        <Select value={formData.equipment} onValueChange={(value) => handleChange('equipment', value)}>
          <SelectTrigger>
            <SelectValue placeholder="What equipment do you have?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-gym">Full Gym Access</SelectItem>
            <SelectItem value="home-basic">Basic Home Equipment</SelectItem>
            <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
            <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
            <SelectItem value="resistance-bands">Resistance Bands</SelectItem>
            <SelectItem value="minimal">Minimal Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Preferred Workout Style</label>
        <Select value={formData.workoutStyle} onValueChange={(value) => handleChange('workoutStyle', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your preferred style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strength-training">Strength Training</SelectItem>
            <SelectItem value="hiit">High-Intensity Interval Training (HIIT)</SelectItem>
            <SelectItem value="cardio">Cardio Focused</SelectItem>
            <SelectItem value="yoga-pilates">Yoga & Pilates</SelectItem>
            <SelectItem value="mixed">Mixed Training</SelectItem>
            <SelectItem value="bodyweight">Bodyweight Training</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Per Workout</label>
          <Select value={formData.workoutDuration} onValueChange={(value) => handleChange('workoutDuration', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15-30">15-30 minutes</SelectItem>
              <SelectItem value="30-45">30-45 minutes</SelectItem>
              <SelectItem value="45-60">45-60 minutes</SelectItem>
              <SelectItem value="60+">60+ minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="workoutFrequency" className="text-sm font-medium">Days Per Week</label>
          <input
            id="workoutFrequency"
            name="workoutFrequency"
            type="number"
            min="1"
            max="7"
            value={formData.workoutFrequency}
            onChange={(e) => handleChange('workoutFrequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="3"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <DevConfigChecker />
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">FitPlan</span>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Profile Setup' : 'Preferences'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Account Details'}
              {step === 2 && 'Tell us about yourself'}
              {step === 3 && 'Your preferences'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : step === 3 ? (
                    'Create Account'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link 
                      href="/auth/login" 
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}