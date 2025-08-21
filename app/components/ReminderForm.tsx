'use client';

import React, { useState } from 'react';
import { createReminder } from '../services/reminderService';
import { useLanguage } from '../hooks/useLanguage';
import { ReminderFormData } from '../types/reminder';

const ReminderForm = () => {
  const { texts } = useLanguage();
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    date: '',
    time: '',
    repeat: 'none',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title || !formData.date || !formData.time) {
      setError(texts.reminderForm.errorMessages.allFieldsRequired);
      return;
    }

    try {
      await createReminder(formData);
      setSuccess(texts.reminderForm.successMessage);
      setFormData({ title: '', date: '', time: '', repeat: 'none' });
      // Optionally, trigger a refresh of the reminder list here
    } catch (err) {
      setError(texts.reminderForm.errorMessages.failedToCreate);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
        {texts.reminderForm.title}
      </h2>
      
      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>}
      {success && <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-center">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder=" "
            className="block w-full px-4 py-3 bg-white/10 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition duration-300 peer"
          />
          <label 
            htmlFor="title"
            className="absolute text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
          >
            {texts.reminderForm.labels.title}
          </label>
        </div>

        <div className="relative">
          <select
            name="repeat"
            id="repeat"
            value={formData.repeat}
            onChange={handleChange}
            className="block w-full px-4 py-3 bg-white/10 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition duration-300 appearance-none"
          >
            <option value="none">{texts.reminderForm.repeatOptions.none}</option>
            <option value="daily">{texts.reminderForm.repeatOptions.daily}</option>
            <option value="weekly">{texts.reminderForm.repeatOptions.weekly}</option>
            <option value="monthly">{texts.reminderForm.repeatOptions.monthly}</option>
          </select>
          <label htmlFor="repeat" className="absolute text-gray-400 text-sm top-[-10px] left-2 bg-slate-800 px-1">
            {texts.reminderForm.labels.repeat}
          </label>
        </div>

        <div className="relative">
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            className="block w-full px-4 py-3 bg-white/10 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition duration-300"
          />
           <label htmlFor="date" className="absolute text-gray-400 text-sm top-[-10px] left-2 bg-slate-800 px-1">
            {texts.reminderForm.labels.date}
          </label>
        </div>

        <div className="relative">
          <input
            type="time"
            name="time"
            id="time"
            value={formData.time}
            onChange={handleChange}
            className="block w-full px-4 py-3 bg-white/10 rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition duration-300"
          />
          <label htmlFor="time" className="absolute text-gray-400 text-sm top-[-10px] left-2 bg-slate-800 px-1">
            {texts.reminderForm.labels.time}
          </label>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
      >
        {texts.reminderForm.submitButton}
      </button>
    </form>
  );
};

export default ReminderForm;
