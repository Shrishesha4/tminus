import { auth, googleProvider } from '$lib/firebase/client';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, deleteUser as firebaseDeleteUser } from 'firebase/auth';
import { user, isLoading } from '$lib/stores/authStore';
import { goto } from '$app/navigation';
import { db } from '$lib/firebase/client';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Initialize auth listener
export function initAuth() {
  console.log("Starting auth initialization");
  
  // Set a shorter timeout
  const authTimeout = setTimeout(() => {
    console.log("Auth timeout reached, setting isLoading to false");
    isLoading.set(false);
  }, 3000); // 3 seconds timeout
  
  // The rest of your auth state change handler
  onAuthStateChanged(auth, async (currentUser) => {
    try {
      console.log("Auth state changed, user:", currentUser?.uid || "null");
      clearTimeout(authTimeout); // Clear the timeout if auth resolves
      
      if (currentUser) {
        // Cache minimal user info for faster loading next time
        localStorage.setItem('tminus_user', JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        }));
        
        user.set(currentUser);
        
        // Don't redirect here - let the page components handle navigation
      } else {
        localStorage.removeItem('tminus_user');
        user.set(null);
      }
    } catch (error) {
      console.error("Error in auth state change:", error);
      // Still set the user even if there's an error
      if (currentUser) user.set(currentUser);
    } finally {
      console.log("Auth initialization complete, setting isLoading to false");
      isLoading.set(false);
    }
  });
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if this is a new user
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists() || !userDoc.data().birthdate) {
      // Explicitly navigate to onboarding for new users
      goto('/onboarding');
    } else {
      // Navigate to dashboard for existing users
      goto('/dashboard');
    }
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    goto('/');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function saveBirthdate(userId: string, birthdate: string, birthTime?: string) {
  try {
    await setDoc(doc(db, 'users', userId), {
      birthdate,
      birthTime: birthTime || null,
      createdAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving birthdate:', error);
    throw error;
  }
}

// New function to update user profile
export async function updateUserProfile(userId: string, data: any) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// New function to delete user account and data
export async function deleteUserAccount(userId: string) {
  try {
    // Delete user data from Firestore
    await deleteDoc(doc(db, 'users', userId));
    
    // Delete journal entries collection
    // Note: In a production app, you would use a Cloud Function to delete subcollections
    
    // Sign out the user
    await signOut();
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
}