# FitPlan Setup Instructions

## Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas account)
- OpenAI API key

## 🔑 API Key Setup

### 1. Get your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)

### 2. Configure Environment Variables
1. Navigate to the `backend` folder
2. Open the `.env` file (already created for you)
3. Replace `your_openai_api_key_here` with your actual OpenAI API key
4. Replace `your_jwt_secret_here_make_it_long_and_random` with a secure random string (at least 32 characters)

Example `.env` file:
```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
MONGODB_URI=mongodb://localhost:27017/fitplan
JWT_SECRET=super-long-random-string-for-jwt-security-12345
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Running the Application

### Option 1: Run Everything at Once (Recommended)
```bash
# From the root directory (/workspace)
npm run setup      # Install all dependencies
npm run dev:full   # Start both backend and frontend
```

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend (in a new terminal)
npm install
npm run dev
```

## 🗄️ Database Setup

### Using Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Windows
   net start MongoDB
   ```
3. The app will create the database automatically

### Using MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Replace `MONGODB_URI` in `.env` with your Atlas connection string

## 🌱 Seed Database (Optional)
```bash
npm run seed
```

## 📱 Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run dev:full` | Start both frontend and backend |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production frontend |
| `npm run seed` | Seed database with sample data |
| `npm run setup` | Install all dependencies |

## 🔍 Troubleshooting

### Common Issues:
1. **Port already in use**: Kill processes on ports 3000 or 5000
2. **MongoDB connection failed**: Ensure MongoDB is running
3. **OpenAI API errors**: Check your API key and billing status
4. **Dependencies issues**: Delete `node_modules` and run `npm install`

### Environment Variables Not Loading:
- Ensure `.env` file is in the `backend` directory
- Restart the backend server after changing `.env`
- Check for typos in variable names

## 📦 Project Structure
```
/workspace
├── app/                 # Next.js frontend pages
├── backend/            # Node.js/Express backend
│   ├── src/           # Backend source code
│   └── .env           # Backend environment variables
├── components/         # React components
├── lib/               # Frontend utilities
└── package.json       # Frontend dependencies
```