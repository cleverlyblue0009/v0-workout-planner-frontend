# FitPlan - AI-Powered Fitness Planner

Transform your fitness journey with personalized AI workout plans, nutrition guidance, and progress tracking.

## 🚀 Features

### AI-Powered Planning
- **Smart Workout Generation**: Personalized workout plans based on your goals, experience, equipment, and schedule
- **Nutrition Planning**: AI-generated meal plans with macro tracking and dietary preference support
- **Progress Analysis**: Intelligent insights and recommendations based on your fitness data

### Comprehensive Tracking
- **Workout Sessions**: Real-time workout tracking with exercise logging and progress monitoring
- **Nutrition Logging**: Food intake tracking with extensive food database and macro calculations
- **Progress Monitoring**: Body measurements, fitness metrics, and goal tracking

### User Experience
- **Modern UI**: Clean, responsive design built with Next.js and Tailwind CSS
- **Real-time Updates**: Live progress updates and notifications
- **Mobile Optimized**: Fully responsive design for all devices

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Radix UI with custom styling
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context for authentication and global state
- **API Integration**: Custom API client with TypeScript support

### Backend (Node.js)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **AI Integration**: OpenAI GPT-4 for plan generation and analysis
- **Real-time**: Socket.IO for live updates
- **Security**: Helmet, CORS, rate limiting, and input validation

### Database Schema
- **Users**: Profile, preferences, goals, and authentication
- **Workouts**: Plans, sessions, exercises, and progress
- **Nutrition**: Food items, meal plans, logs, and tracking
- **Progress**: Body measurements, fitness metrics, and goals

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API key (optional, for AI features)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitplan
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   
   Backend (`/backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/fitplan
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRE=7d
   OPENAI_API_KEY=your-openai-api-key-here
   CLIENT_URL=http://localhost:3000
   ```

   Frontend (`/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the development servers**
   ```bash
   npm run dev:full
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📁 Project Structure

```
fitplan/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── workouts/          # Workout pages
│   ├── nutrition/         # Nutrition pages
│   └── progress/          # Progress pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── navigation.tsx    # Navigation component
├── contexts/             # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── backend/              # Backend API server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── config/       # Configuration files
│   │   └── utils/        # Utility functions
│   └── package.json     # Backend dependencies
└── README.md            # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Workouts
- `GET /api/workouts/plans` - Get workout plans
- `POST /api/workouts/plans` - Create workout plan
- `POST /api/workouts/sessions` - Start workout session
- `GET /api/workouts/sessions/active` - Get active session
- `PUT /api/workouts/sessions/:id` - Update session
- `POST /api/workouts/sessions/:id/complete` - Complete session

### Nutrition
- `GET /api/nutrition/foods/search` - Search food items
- `GET /api/nutrition/log` - Get nutrition log
- `POST /api/nutrition/log/food` - Add food to log
- `PUT /api/nutrition/log/water` - Update water intake

### AI Services
- `POST /api/ai/generate-workout` - Generate AI workout plan
- `POST /api/ai/generate-nutrition` - Generate AI nutrition plan
- `GET /api/ai/analyze-progress` - Get progress analysis
- `GET /api/ai/recommendations` - Get AI recommendations

## 🎯 Key Features Implemented

### ✅ Completed Features
1. **Backend Infrastructure**
   - Express.js server with TypeScript
   - MongoDB database with comprehensive schemas
   - JWT authentication system
   - RESTful API endpoints
   - OpenAI integration for AI features
   - Socket.IO for real-time updates

2. **Frontend Application**
   - Next.js 14 with TypeScript
   - Authentication system with context
   - Responsive dashboard with real data
   - API integration layer
   - Modern UI components

3. **Database Design**
   - User management with profiles and preferences
   - Workout plans and session tracking
   - Nutrition logging and food database
   - Progress tracking and goal management

4. **AI Integration**
   - Workout plan generation based on user preferences
   - Nutrition plan creation with macro calculations
   - Progress analysis and recommendations
   - Intelligent personalization

### 🚧 In Progress
1. **Frontend Pages**
   - Complete workout planner integration
   - Nutrition tracking interface
   - Progress analytics dashboard
   - User profile management

2. **Advanced Features**
   - Real-time notifications
   - Social features and sharing
   - Advanced analytics and insights
   - Mobile app optimization

## 🔐 Security Features

- **Authentication**: JWT-based secure authentication
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse  
- **CORS**: Properly configured CORS policies
- **Helmet**: Security headers for protection
- **Password Hashing**: Bcrypt for secure password storage

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure environment variables for production
3. Set up OpenAI API key for AI features
4. Configure CORS for your domain

### Build Commands
```bash
# Build frontend
npm run build

# Start production server
npm start

# Backend production
cd backend && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/fitplan/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Radix UI for component primitives
- Tailwind CSS for styling system
- The open-source community for inspiration and tools

---

**Ready to transform your fitness journey? Get started with FitPlan today!** 💪