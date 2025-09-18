import { getIdToken } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await getIdToken();
    } catch (error) {
      console.error('Error getting Firebase ID token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Get Firebase ID token for authenticated requests
    const token = await this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async setupProfile(profileData: {
    name?: string;
    profile?: any;
    preferences?: any;
  }) {
    return this.request('/auth/setup-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async syncUser() {
    return this.request('/auth/sync', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteAccount() {
    return this.request('/auth/account', {
      method: 'DELETE',
    });
  }

  // Workout endpoints
  async getWorkoutPlans(params?: {
    page?: number;
    limit?: number;
    goal?: string;
    difficulty?: string;
    equipment?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/workouts/plans${queryString ? `?${queryString}` : ''}`);
  }

  async getWorkoutPlan(id: string) {
    return this.request(`/workouts/plans/${id}`);
  }

  async createWorkoutPlan(planData: any) {
    return this.request('/workouts/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async startWorkoutSession(sessionData: { workoutPlanId: string; name: string }) {
    return this.request('/workouts/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getWorkoutSession(sessionId: string) {
    return this.request(`/workouts/sessions/${sessionId}`);
  }

  async getActiveSession() {
    return this.request('/workouts/sessions/active');
  }

  async updateWorkoutSession(sessionId: string, updateData: any) {
    return this.request(`/workouts/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async completeWorkoutSession(sessionId: string, completionData: {
    rating?: number;
    notes?: string;
    mood?: string;
  }) {
    return this.request(`/workouts/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async getWorkoutHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/workouts/sessions${queryString ? `?${queryString}` : ''}`);
  }

  async getWorkoutStats(period?: string) {
    return this.request(`/workouts/stats${period ? `?period=${period}` : ''}`);
  }

  // Nutrition endpoints
  async searchFoods(query: string, options?: {
    category?: string;
    dietary?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams({ q: query });
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/nutrition/foods/search?${params.toString()}`);
  }

  async getNutritionLog(date?: string) {
    return this.request(`/nutrition/log${date ? `?date=${date}` : ''}`);
  }

  async addFoodToLog(foodData: {
    date: string;
    mealType: string;
    foodId?: string;
    name: string;
    quantity: { amount: number; unit: string };
    nutrition: any;
  }) {
    return this.request('/nutrition/log/food', {
      method: 'POST',
      body: JSON.stringify(foodData),
    });
  }

  async updateWaterIntake(date: string, amount: number) {
    return this.request('/nutrition/log/water', {
      method: 'PUT',
      body: JSON.stringify({ date, amount }),
    });
  }

  async getNutritionStats(period?: string) {
    return this.request(`/nutrition/stats${period ? `?period=${period}` : ''}`);
  }

  async getNutritionPlans(params?: {
    page?: number;
    limit?: number;
    goal?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/nutrition/plans${queryString ? `?${queryString}` : ''}`);
  }

  async getMealSuggestions(params?: {
    mealType?: string;
    targetCalories?: number;
    dietaryRestrictions?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/nutrition/suggestions${queryString ? `?${queryString}` : ''}`);
  }

  // AI endpoints
  async generateWorkoutPlan(preferences: {
    goal: string;
    experience: string;
    equipment: string;
    timePerDay: string;
    workoutStyle: string;
  }) {
    return this.request('/ai/generate-workout', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async generateNutritionPlan(preferences: any) {
    return this.request('/ai/generate-nutrition', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async analyzeProgress() {
    return this.request('/ai/analyze-progress');
  }

  async getRecommendations() {
    return this.request('/ai/recommendations');
  }

  async regenerateWorkoutPlan(planId: string, feedback: string, adjustments: any) {
    return this.request('/ai/regenerate-workout', {
      method: 'POST',
      body: JSON.stringify({ planId, feedback, adjustments }),
    });
  }
}

// Create singleton instance
export const api = new ApiClient();

// Export types
export type { ApiResponse };