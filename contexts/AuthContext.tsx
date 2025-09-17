"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  signUpWithEmailAndPassword, 
  signInWithEmailAndPasswordAuth,
  signInWithGoogle,
  signOutAuth,
  resetPassword,
  onAuthStateChanged,
  FirebaseUser 
} from '@/lib/firebase';
import { api } from '@/lib/api';

interface User {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  profile: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    activityLevel?: string;
    fitnessGoal?: string;
    targetWeight?: number;
  };
  preferences: {
    equipment?: string;
    workoutStyle?: string;
    workoutDuration?: string;
    workoutFrequency?: number;
    dietaryRestrictions?: string[];
    allergies?: string[];
  };
  nutritionGoals: {
    targetCalories?: number;
    macroRatios: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  streak: {
    current: number;
    longest: number;
    lastWorkoutDate?: string;
  };
  achievements?: Array<{
    title: string;
    description: string;
    achievedAt: string;
    category: string;
  }>;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogleAuth: () => Promise<boolean>;
  signOut: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<boolean>;
  setupProfile: (profileData: any) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in, sync with backend
        try {
          const response = await api.syncUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
          }
        } catch (error: any) {
          console.error('User sync failed:', error);
          
          // Provide more specific error information
          if (error.message?.includes('fetch')) {
            console.error('🌐 Backend Connection Issue: Cannot connect to backend server');
            console.error('📝 Make sure the backend server is running on http://localhost:5000');
            console.error('💡 Run: cd backend && npm run dev');
          } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
            console.error('🔐 Authentication Issue: Firebase token validation failed');
            console.error('📝 Check backend Firebase Admin SDK configuration');
          }
          
          // If sync fails, we still have Firebase user but no backend user
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await signUpWithEmailAndPassword(email, password, name);
      // The onAuthStateChanged will handle the rest
      return true;
    } catch (error: any) {
      console.error('Sign up failed:', error);
      setLoading(false);
      
      // Log specific error details for debugging
      if (error.message?.includes('Firebase configuration is incomplete')) {
        console.error('🔥 Firebase Configuration Issue:', error.message);
        console.error('📝 Please check your .env.local file and see SETUP_INSTRUCTIONS.md');
      }
      
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await signInWithEmailAndPasswordAuth(email, password);
      // The onAuthStateChanged will handle the rest
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      setLoading(false);
      return false;
    }
  };

  const signInWithGoogleAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // The onAuthStateChanged will handle the rest
      return true;
    } catch (error: any) {
      console.error('Google sign in failed:', error);
      setLoading(false);
      
      // Log specific error details for debugging
      if (error.message?.includes('Firebase configuration is incomplete')) {
        console.error('🔥 Firebase Configuration Issue:', error.message);
        console.error('📝 Please check your .env.local file and see SETUP_INSTRUCTIONS.md');
      } else if (error.message?.includes('popup')) {
        console.error('🚪 Popup Issue:', error.message);
      }
      
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await signOutAuth();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const resetUserPassword = async (email: string): Promise<boolean> => {
    try {
      await resetPassword(email);
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  };

  const setupProfile = async (profileData: {
    name?: string;
    profile?: any;
    preferences?: any;
  }): Promise<boolean> => {
    try {
      const response = await api.setupProfile(profileData);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile setup failed:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const response = await api.updateProfile(profileData);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      const response = await api.deleteAccount();
      
      if (response.success) {
        await signOut();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Account deletion failed:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getMe();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signInWithGoogleAuth,
    signOut,
    resetUserPassword,
    setupProfile,
    updateProfile,
    deleteAccount,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}