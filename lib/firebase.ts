import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig] || firebaseConfig[key as keyof typeof firebaseConfig] === 'your_firebase_api_key' || firebaseConfig[key as keyof typeof firebaseConfig]?.includes('your_'));
  
  if (missingKeys.length > 0) {
    console.error('Firebase configuration is incomplete. Missing or placeholder values for:', missingKeys);
    console.error('Please check your .env.local file and ensure all Firebase configuration values are set properly.');
    console.error('See SETUP_INSTRUCTIONS.md for detailed setup instructions.');
    return false;
  }
  return true;
};

// Check configuration on module load
if (typeof window !== 'undefined') {
  validateFirebaseConfig();
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signUpWithEmailAndPassword = async (email: string, password: string, displayName?: string) => {
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  
  // Send email verification
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  
  return userCredential;
};

export const signInWithEmailAndPasswordAuth = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
  
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by the browser. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/configuration-not-found') {
      throw new Error('Google authentication is not properly configured. Please check Firebase console settings.');
    }
    throw error;
  }
};

export const signOutAuth = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export { onAuthStateChanged };
export type { FirebaseUser };