require('dotenv').config();
const connectDB = require('../config/database');
const { seedFoodDatabase } = require('../utils/seedData');

const runSeed = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Seed food database
    await seedFoodDatabase();
    
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

runSeed();