import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { app } from './firebase';
import { PromptScores } from './tiers';

export interface SavedPromptRecord {
  id?: string;
  userId: string;
  title: string;
  original: string;
  optimized: string;
  tool: string;
  taskType: string;
  before: number;
  score: number;
  tier: string;
  assumptions: string[];
  changes: { add: string; why: string }[];
  createdAt: number;
}

export const db = typeof window !== 'undefined' ? getFirestore(app) : null;

/**
 * Save a new prompt under users/{uid}/prompts/{promptId}
 */
export async function saveUserPrompt(uid: string, promptData: Omit<SavedPromptRecord, 'id' | 'userId' | 'createdAt'>): Promise<{ id: string; error: string | null }> {
  if (!db) {
    return { id: '', error: 'Firestore client not initialized.' };
  }

  try {
    const promptsRef = collection(db, 'users', uid, 'prompts');
    const newDocRef = doc(promptsRef);
    const record: SavedPromptRecord = {
      ...promptData,
      id: newDocRef.id,
      userId: uid,
      createdAt: Date.now(),
    };

    await setDoc(newDocRef, record);
    return { id: newDocRef.id, error: null };
  } catch (err: any) {
    return { id: '', error: err?.message || 'Failed to save prompt to Firestore.' };
  }
}

/**
 * Fetch all saved prompts for a user ordered by creation date
 */
export async function fetchUserPrompts(uid: string): Promise<{ prompts: SavedPromptRecord[]; error: string | null }> {
  if (!db) {
    return { prompts: [], error: 'Firestore client not initialized.' };
  }

  try {
    const promptsRef = collection(db, 'users', uid, 'prompts');
    const q = query(promptsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const prompts: SavedPromptRecord[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as SavedPromptRecord),
    }));

    return { prompts, error: null };
  } catch (err: any) {
    return { prompts: [], error: err?.message || 'Failed to fetch prompts.' };
  }
}

/**
 * Delete a prompt document under users/{uid}/prompts/{promptId}
 */
export async function deleteUserPrompt(uid: string, promptId: string): Promise<{ error: string | null }> {
  if (!db) {
    return { error: 'Firestore client not initialized.' };
  }

  try {
    const docRef = doc(db, 'users', uid, 'prompts', promptId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete prompt.' };
  }
}
