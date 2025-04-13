/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Make client-side env vars available to server-side code
  if (import.meta.env) {
    // Gemini API key
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    }
    
    // Firebase Admin SDK environment variables
    if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      process.env.FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    }
    if (import.meta.env.VITE_FIREBASE_CLIENT_EMAIL) {
      process.env.FIREBASE_CLIENT_EMAIL = import.meta.env.VITE_FIREBASE_CLIENT_EMAIL;
    }
    if (import.meta.env.VITE_FIREBASE_PRIVATE_KEY) {
      process.env.FIREBASE_PRIVATE_KEY = import.meta.env.VITE_FIREBASE_PRIVATE_KEY;
    }
  }
  
  return await resolve(event);
}