import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 
                     import.meta.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
                     
  initializeApp({
    credential: cert({
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
}

export const POST = async ({ request }: RequestEvent) => {
  try {
    const { userId, idToken } = await request.json();
    
    if (!userId || !idToken) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify the ID token
    await getAuth().verifyIdToken(idToken);
    
    // Delete user data from Firestore
    const db = getFirestore();
    
    // Delete user document
    await db.collection('users').doc(userId).delete();
    
    // Delete journal entries subcollection
    const journalSnapshot = await db.collection(`users/${userId}/journal`).get();
    const batch = db.batch();
    
    journalSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Delete the user authentication account
    await getAuth().deleteUser(userId);
    
    return json({ success: true });
  } catch (error) {
    console.error('Error in delete user API:', error);
    return json({ error: 'Failed to delete user account' }, { status: 500 });
  }
};