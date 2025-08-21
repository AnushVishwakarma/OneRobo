export interface Reminder {
  id: string;
  title: string;
  dateTime: string; // Combined date and time
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  createdAt: any; // Firestore timestamp
  userId?: string;
}

export interface ReminderFormData {
  title: string;
  date: string;
  time: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
}
