import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '$lib/firebase/admin';

// Initialize Firebase Admin once
initializeAdminApp();

export const POST = async ({ request }: RequestEvent) => {
  try {
    const { userId, idToken } = await request.json();
    
    if (!userId || !idToken) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify the ID token
    try {
      await getAuth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying token:', error);
      return json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    
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
    try {
      await getAuth().deleteUser(userId);
    } catch (authError) {
      console.error('Error deleting auth user:', authError);
      // Continue with the process even if auth deletion fails
      // The client will handle sign out
    }
    
    return json({ success: true });
  } catch (error) {
    console.error('Error in delete user API:', error);
    return json({ error: 'Failed to delete user account' }, { status: 500 });
  }
};