const { FoodItem } = require('../models/Nutrition');

// Sample food items for the database
const sampleFoods = [
  // Proteins
  {
    name: "Chicken Breast (Skinless)",
    category: "protein",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74
    },
    dietaryFlags: ["gluten-free", "dairy-free"],
    isVerified: true
  },
  {
    name: "Salmon Fillet",
    category: "protein",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 208,
      protein: 25,
      carbohydrates: 0,
      fat: 12,
      fiber: 0,
      sugar: 0,
      sodium: 59
    },
    dietaryFlags: ["gluten-free", "dairy-free"],
    isVerified: true
  },
  {
    name: "Greek Yogurt (Plain, Non-fat)",
    category: "dairy",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 59,
      protein: 10,
      carbohydrates: 3.6,
      fat: 0.4,
      fiber: 0,
      sugar: 3.2,
      sodium: 36
    },
    dietaryFlags: ["vegetarian", "gluten-free"],
    allergens: ["milk"],
    isVerified: true
  },

  // Carbohydrates
  {
    name: "Brown Rice (Cooked)",
    category: "grains",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 111,
      protein: 2.6,
      carbohydrates: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.4,
      sodium: 5
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Quinoa (Cooked)",
    category: "grains",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 120,
      protein: 4.4,
      carbohydrates: 22,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9,
      sodium: 7
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Sweet Potato (Baked)",
    category: "vegetables",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 90,
      protein: 2,
      carbohydrates: 21,
      fat: 0.1,
      fiber: 3.3,
      sugar: 6.8,
      sodium: 6
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },

  // Fruits
  {
    name: "Banana (Medium)",
    category: "fruits",
    servingSize: { amount: 1, unit: "piece" },
    nutrition: {
      calories: 105,
      protein: 1.3,
      carbohydrates: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14,
      sodium: 1
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Apple (Medium)",
    category: "fruits",
    servingSize: { amount: 1, unit: "piece" },
    nutrition: {
      calories: 95,
      protein: 0.5,
      carbohydrates: 25,
      fat: 0.3,
      fiber: 4.4,
      sugar: 19,
      sodium: 2
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Blueberries",
    category: "fruits",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 57,
      protein: 0.7,
      carbohydrates: 14,
      fat: 0.3,
      fiber: 2.4,
      sugar: 10,
      sodium: 1
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },

  // Vegetables
  {
    name: "Broccoli (Steamed)",
    category: "vegetables",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 35,
      protein: 2.4,
      carbohydrates: 7,
      fat: 0.4,
      fiber: 3.3,
      sugar: 1.2,
      sodium: 41
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Spinach (Raw)",
    category: "vegetables",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 23,
      protein: 2.9,
      carbohydrates: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },

  // Nuts and Seeds
  {
    name: "Almonds",
    category: "nuts-seeds",
    servingSize: { amount: 30, unit: "g" },
    nutrition: {
      calories: 173,
      protein: 6.4,
      carbohydrates: 6.5,
      fat: 15,
      fiber: 3.7,
      sugar: 1.2,
      sodium: 0.3
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    allergens: ["tree-nuts"],
    isVerified: true
  },
  {
    name: "Chia Seeds",
    category: "nuts-seeds",
    servingSize: { amount: 30, unit: "g" },
    nutrition: {
      calories: 147,
      protein: 5.6,
      carbohydrates: 12,
      fat: 9.3,
      fiber: 11,
      sugar: 0,
      sodium: 5
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },

  // Dairy
  {
    name: "Whole Milk",
    category: "dairy",
    servingSize: { amount: 240, unit: "ml" },
    nutrition: {
      calories: 149,
      protein: 7.7,
      carbohydrates: 11.7,
      fat: 8,
      fiber: 0,
      sugar: 12.3,
      sodium: 105
    },
    dietaryFlags: ["vegetarian"],
    allergens: ["milk"],
    isVerified: true
  },
  {
    name: "Cheddar Cheese",
    category: "dairy",
    servingSize: { amount: 30, unit: "g" },
    nutrition: {
      calories: 113,
      protein: 7,
      carbohydrates: 0.4,
      fat: 9,
      fiber: 0,
      sugar: 0.1,
      sodium: 174
    },
    dietaryFlags: ["vegetarian"],
    allergens: ["milk"],
    isVerified: true
  },

  // Legumes
  {
    name: "Black Beans (Cooked)",
    category: "legumes",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 132,
      protein: 8.9,
      carbohydrates: 23,
      fat: 0.5,
      fiber: 8.7,
      sugar: 0.3,
      sodium: 2
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Lentils (Cooked)",
    category: "legumes",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 116,
      protein: 9,
      carbohydrates: 20,
      fat: 0.4,
      fiber: 7.9,
      sugar: 1.8,
      sodium: 2
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },

  // Oils and Fats
  {
    name: "Olive Oil (Extra Virgin)",
    category: "oils-fats",
    servingSize: { amount: 15, unit: "ml" },
    nutrition: {
      calories: 119,
      protein: 0,
      carbohydrates: 0,
      fat: 13.5,
      fiber: 0,
      sugar: 0,
      sodium: 0
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  },
  {
    name: "Avocado",
    category: "fruits",
    servingSize: { amount: 100, unit: "g" },
    nutrition: {
      calories: 160,
      protein: 2,
      carbohydrates: 9,
      fat: 15,
      fiber: 7,
      sugar: 0.7,
      sodium: 7
    },
    dietaryFlags: ["vegetarian", "vegan", "gluten-free"],
    isVerified: true
  }
];

// Function to seed the database
const seedFoodDatabase = async () => {
  try {
    console.log('Seeding food database...');
    
    // Clear existing food items (optional)
    await FoodItem.deleteMany({});
    
    // Insert sample foods
    await FoodItem.insertMany(sampleFoods);
    
    console.log(`✅ Successfully seeded ${sampleFoods.length} food items`);
  } catch (error) {
    console.error('❌ Error seeding food database:', error);
  }
};

module.exports = { seedFoodDatabase, sampleFoods };