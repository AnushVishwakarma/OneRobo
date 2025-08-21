import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Reminder, ReminderFormData } from '../types/reminder';

const COLLECTION_NAME = 'reminders';

// Helper to check if a reminder's datetime has passed
const hasDateTimePassed = (dateTime: string): boolean => {
  try {
    return new Date(dateTime) < new Date();
  } catch (error) {
    console.error('Error checking if dateTime has passed:', dateTime, error);
    return false;
  }
};

// Clean up old reminders and mark past reminders as completed
export const cleanupReminders = async (userId?: string): Promise<void> => {
  try {
    const batch = writeBatch(db as any);
    let remindersQuery: any = collection(db as any, COLLECTION_NAME);
    if (userId) {
      remindersQuery = query(remindersQuery, where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(remindersQuery);
    
    querySnapshot.forEach((docSnapshot) => {
      const reminder = docSnapshot.data() as Reminder;
      const reminderRef = doc(db as any, COLLECTION_NAME, docSnapshot.id);

      // Mark non-repeating reminders as completed if their time has passed
      if (reminder.repeat === 'none' && !reminder.completed && hasDateTimePassed(reminder.dateTime)) {
        batch.update(reminderRef, { completed: true });
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error cleaning up reminders:', error);
    throw error;
  }
};

// Create a new reminder
export const createReminder = async (reminderData: ReminderFormData, userId?: string): Promise<string> => {
  try {
    const { title, date, time, repeat } = reminderData;
    const dateTime = new Date(`${date}T${time}`).toISOString();

    const reminderToSave = {
      title,
      dateTime,
      repeat,
      completed: false,
      createdAt: Timestamp.now(),
      ...(userId && { userId }),
    };

    const docRef = await addDoc(collection(db as any, COLLECTION_NAME), reminderToSave);
    return docRef.id;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

// Get all reminders for a user
export const getReminders = async (userId?: string): Promise<Reminder[]> => {
  try {
    await cleanupReminders(userId);

    let q: any = collection(db as any, COLLECTION_NAME);
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Reminder, 'id'>;
      return {
        id: doc.id,
        ...data,
      };
    }) as Reminder[];
  } catch (error) {
    console.error('Error getting reminders:', error);
    throw error;
  }
};

// Update a reminder
export const updateReminder = async (id: string, updates: Partial<Reminder>): Promise<void> => {
  try {
    const reminderRef = doc(db as any, COLLECTION_NAME, id);
    await updateDoc(reminderRef, updates);
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (id: string): Promise<void> => {
  try {
    const reminderRef = doc(db as any, COLLECTION_NAME, id);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};
