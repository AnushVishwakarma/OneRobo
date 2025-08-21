'use client';

import React, { useEffect, useState } from 'react';
import { getReminders, updateReminder, deleteReminder } from '../services/reminderService';
import { useLanguage } from '../hooks/useLanguage';
import { Reminder } from '../types/reminder';

const ReminderList = () => {
  const { texts } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const fetchedReminders = await getReminders();
      setReminders(fetchedReminders);
      setError(null);
    } catch (err) {
      setError(texts.reminderList.errorMessages.failedToFetch);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateReminder(id, { completed: !completed });
      fetchReminders(); // Refresh list
    } catch (err) {
      setError(texts.reminderList.errorMessages.failedToUpdate);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
      fetchReminders(); // Refresh list
    } catch (err) {
      setError(texts.reminderList.errorMessages.failedToDelete);
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">{texts.reminderList.loading}</div>;
  }

  if (error) {
    return <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>;
  }

  return (
    <div className="space-y-6 text-white mt-12">
      <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-8">
        {texts.reminderList.title}
      </h2>

      {reminders.length === 0 ? (
        <p className="text-center text-gray-500">{texts.reminderList.noReminders}</p>
      ) : (
        <ul className="space-y-4">
          {reminders.map(reminder => (
            <li 
              key={reminder.id}
              className={`p-5 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-between ${reminder.completed ? 'bg-green-500/20 border-l-4 border-green-500' : 'bg-white/10 border-l-4 border-purple-500'}`}
            >
              <div>
                <h3 className={`text-xl font-semibold ${reminder.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {reminder.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {new Date(reminder.dateTime).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 capitalize">{texts.reminderForm.labels.repeat}: {reminder.repeat}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleToggleComplete(reminder.id, reminder.completed)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${reminder.completed ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {reminder.completed ? texts.reminderList.markAsIncomplete : texts.reminderList.markAsComplete}
                </button>
                <button 
                  onClick={() => handleDelete(reminder.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  {texts.reminderList.deleteButton}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReminderList;
