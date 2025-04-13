import { db } from '$lib/firebase/client';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

// Add a new journal entry
export async function addJournalEntry(
  userId: string, 
  content: string, 
  periodId: string = '', 
  periodType: string = 'day'
) {
  try {
    // Create a timestamp with date and time
    const now = new Date();
    
    await addDoc(collection(db, `users/${userId}/journal`), {
      content,
      periodId,
      periodType,
      createdAt: now,
      timestamp: now.toISOString(), // Single ISO string for all date/time needs
      // Removed individual date/time components (year, month, day, hour, minute, second)
    });
  } catch (error) {
    console.error('Error adding journal entry:', error);
    throw error;
  }
}

// Get all journal entries for a user
export async function getJournalEntries(userId: string, periodId: string = '') {
  try {
    let q;
    
    if (periodId) {
      // Get entries for a specific period
      q = query(
        collection(db, `users/${userId}/journal`),
        where('periodId', '==', periodId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all entries
      q = query(
        collection(db, `users/${userId}/journal`),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
}