// Simple location service for getting location information
// Using a free reverse geocoding service

class LocationService {
  // Get location information from coordinates using a free service
  static async getLocationFromCoordinates(latitude, longitude) {
    try {
      // Using OpenStreetMap's Nominatim service (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FitnessApp/1.0 (nutrition-planner)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      if (data && data.address) {
        return {
          country: data.address.country || null,
          region: data.address.state || data.address.region || null,
          city: data.address.city || data.address.town || data.address.village || null,
          latitude,
          longitude,
          timezone: this.getTimezoneFromCoordinates(latitude, longitude),
          lastUpdated: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Location service error:', error);
      return null;
    }
  }

  // Simple timezone estimation based on longitude
  static getTimezoneFromCoordinates(latitude, longitude) {
    // Very basic timezone calculation (longitude / 15)
    // For production, use a proper timezone service
    const timezoneOffset = Math.round(longitude / 15);
    return `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
  }

  // Get regional food preferences based on location
  static getRegionalFoodPreferences(location) {
    if (!location || !location.country) {
      return {
        cuisineTypes: ['international', 'mediterranean'],
        commonIngredients: ['rice', 'chicken', 'vegetables', 'olive oil'],
        mealPatterns: ['3 meals', 'light breakfast', 'substantial lunch', 'moderate dinner']
      };
    }

    const country = location.country.toLowerCase();
    
    // Basic regional preferences (can be expanded)
    const regionalPreferences = {
      'united states': {
        cuisineTypes: ['american', 'mexican', 'italian', 'asian fusion'],
        commonIngredients: ['beef', 'chicken', 'potatoes', 'corn', 'wheat', 'dairy'],
        mealPatterns: ['3 meals', 'substantial breakfast', 'light lunch', 'large dinner'],
        seasonalConsiderations: 'Four distinct seasons affect ingredient availability'
      },
      'italy': {
        cuisineTypes: ['mediterranean', 'italian'],
        commonIngredients: ['pasta', 'tomatoes', 'olive oil', 'cheese', 'herbs', 'seafood'],
        mealPatterns: ['light breakfast', 'substantial lunch', 'late dinner'],
        seasonalConsiderations: 'Mediterranean climate with seasonal produce'
      },
      'japan': {
        cuisineTypes: ['japanese', 'asian'],
        commonIngredients: ['rice', 'fish', 'soy', 'vegetables', 'seaweed', 'tofu'],
        mealPatterns: ['balanced meals', 'rice with every meal', 'seasonal ingredients'],
        seasonalConsiderations: 'Strong seasonal eating traditions'
      },
      'india': {
        cuisineTypes: ['indian', 'south asian'],
        commonIngredients: ['rice', 'lentils', 'spices', 'vegetables', 'yogurt', 'wheat'],
        mealPatterns: ['2-3 meals', 'vegetarian-friendly', 'spiced foods'],
        seasonalConsiderations: 'Monsoon and dry seasons affect ingredient availability'
      },
      'mexico': {
        cuisineTypes: ['mexican', 'latin american'],
        commonIngredients: ['beans', 'corn', 'tomatoes', 'peppers', 'avocado', 'lime'],
        mealPatterns: ['substantial breakfast', 'large lunch', 'light dinner'],
        seasonalConsiderations: 'Tropical and temperate ingredients available'
      }
    };

    return regionalPreferences[country] || {
      cuisineTypes: ['international', 'local'],
      commonIngredients: ['rice', 'chicken', 'vegetables', 'local grains'],
      mealPatterns: ['3 meals', 'balanced portions'],
      seasonalConsiderations: 'Local seasonal ingredients preferred'
    };
  }

  // Get climate-based recommendations
  static getClimateRecommendations(location) {
    if (!location || !location.latitude) {
      return {
        hydrationLevel: 'moderate',
        foodTemperature: 'mixed',
        seasonalFocus: 'year-round variety'
      };
    }

    const latitude = Math.abs(location.latitude);
    
    if (latitude < 23.5) {
      // Tropical
      return {
        hydrationLevel: 'high',
        foodTemperature: 'cooling foods preferred',
        seasonalFocus: 'fresh fruits, light meals, high water content foods'
      };
    } else if (latitude < 35) {
      // Subtropical
      return {
        hydrationLevel: 'moderate-high',
        foodTemperature: 'mixed with seasonal variation',
        seasonalFocus: 'seasonal variety with summer cooling foods'
      };
    } else if (latitude < 50) {
      // Temperate
      return {
        hydrationLevel: 'moderate',
        foodTemperature: 'seasonal variation important',
        seasonalFocus: 'four-season eating patterns'
      };
    } else {
      // Cold
      return {
        hydrationLevel: 'moderate',
        foodTemperature: 'warming foods in winter',
        seasonalFocus: 'hearty meals, preserved foods, warming spices'
      };
    }
  }
}

module.exports = LocationService;