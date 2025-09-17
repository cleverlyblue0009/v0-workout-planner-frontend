"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    profile?: any;
    preferences?: any;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('fitplan_token');
      if (!token) {
        setLoading(false);
        return;
      }

      api.setToken(token);
      const response = await api.getMe();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        // Invalid token, clear it
        localStorage.removeItem('fitplan_token');
        api.setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('fitplan_token');
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    profile?: any;
    preferences?: any;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.register(userData);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    api.logout();
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
    loading,
    login,
    register,
    logout,
    updateProfile,
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