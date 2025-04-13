import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { dev } from '$app/environment';

// Initialize Firebase Admin
export function initializeAdminApp() {
  if (getApps().length === 0) {
    try {
      // For production, use environment variables
      if (!dev) {
        // Check if we have the required environment variables
        if (!process.env.FIREBASE_PROJECT_ID || 
            !process.env.FIREBASE_CLIENT_EMAIL || 
            !process.env.FIREBASE_PRIVATE_KEY) {
          throw new Error('Missing Firebase Admin environment variables');
        }
        
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // The private key comes as a string with "\n" characters
            // We need to replace them with actual newlines
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          })
        });
      } else {
        // For development, use a service account file if available
        try {
          // Try to import the service account from a local file
          // This file should be in .gitignore
          const serviceAccount = require('../../../firebase-service-account.json');
          initializeApp({
            credential: cert(serviceAccount)
          });
        } catch (error) {
          console.error('Failed to initialize Firebase Admin with service account file:', error);
          console.log('Falling back to client-side Firebase for development');
          // In development, we can skip admin initialization
          // and rely on client-side deletion as a fallback
        }
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
    }
  }
}