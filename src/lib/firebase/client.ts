import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Add profile image error handling
auth.onAuthStateChanged((user) => {
  if (user && user.photoURL) {
    // Pre-load the image to check if it's accessible
    const img = new Image();
    img.onerror = () => {
      // If image fails to load, set a local fallback
      console.log('User profile image failed to load, using fallback');
      // We can't directly modify the user object, but we can store this info
      localStorage.setItem('useProfileImageFallback', 'true');
    };
    img.src = user.photoURL;
  }
});

// Register the service worker for better auth persistence
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/background-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

export { app, auth, db, googleProvider };

// Helper function to get profile image with fallback
export function getProfileImageUrl(user: { photoURL: any; }) {
  if (!user) return null;
  
  // Check if we should use fallback
  if (localStorage.getItem('useProfileImageFallback') === 'true') {
    return '/images/default-profile.jpg'; // Make sure this file exists in your static folder
  }
  
  return user.photoURL;
}