# Authentication Setup Instructions

## Current Issue
You're experiencing authentication failures because the application is missing proper configuration. Here's how to fix it:

## Required Setup Steps

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication with Email/Password and Google providers
4. Get your Firebase configuration from Project Settings > General

### 2. Frontend Configuration (.env.local)
Replace the placeholder values in `/workspace/.env.local` with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### 3. Backend Configuration (.env)
1. Generate a Firebase Admin SDK service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
2. Extract values from the JSON and update `/workspace/backend/.env`

### 4. Database Setup
Install and start MongoDB:
```bash
# For Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# For macOS with Homebrew
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

### 5. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

## Common Issues & Solutions

### "Failed to create account. Please try again."
- Check Firebase configuration in `.env.local`
- Ensure Firebase Authentication is enabled
- Check browser console for detailed error messages

### "Google sign up failed"
- Verify Google authentication is enabled in Firebase Console
- Check that your domain is authorized in Firebase Auth settings
- Ensure popup blockers are disabled

### Backend Connection Issues
- Verify MongoDB is running
- Check that backend server is running on port 5000
- Ensure CORS is properly configured

## Development Mode
For quick testing, you can use the Firebase Emulator Suite:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```