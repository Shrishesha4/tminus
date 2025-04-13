import { db } from '$lib/firebase/client';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// Add a new journal entry
export async function addJournalEntry(userId: string, content: string) {
  try {
    await addDoc(collection(db, `users/${userId}/journal`), {
      content,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding journal entry:', error);
    throw error;
  }
}

// Get all journal entries for a user
export async function getJournalEntries(userId: string) {
  try {
    const q = query(
      collection(db, `users/${userId}/journal`),
      orderBy('createdAt', 'desc')
    );
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