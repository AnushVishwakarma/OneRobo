'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const texts = {
  en: {
    title: 'Reminder App',
    subtitle: 'A simple and elegant reminder application.',
    stats: {
      lightning: 'Lightning Fast',
      smart: 'Smart Reminders',
      premium: 'Premium Feel',
    },
    footer: 'All systems operational',
    reminderForm: {
      title: 'Create a New Reminder',
      labels: {
        title: 'Title',
        date: 'Date',
        time: 'Time',
        repeat: 'Repeat',
      },
      repeatOptions: {
        none: 'None',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
      },
      submitButton: 'Add Reminder',
      successMessage: 'Reminder created successfully!',
      errorMessages: {
        allFieldsRequired: 'All fields are required.',
        failedToCreate: 'Failed to create reminder.',
      },
    },
    reminderList: {
      title: 'Your Reminders',
      loading: 'Loading reminders...',
      noReminders: 'You have no reminders yet.',
      markAsComplete: 'Complete',
      markAsIncomplete: 'Undo',
      deleteButton: 'Delete',
      errorMessages: {
        failedToFetch: 'Failed to fetch reminders.',
        failedToUpdate: 'Failed to update reminder.',
        failedToDelete: 'Failed to delete reminder.',
      },
    },
  },
  es: {
    title: 'Aplicación de Recordatorios',
    subtitle: 'Una aplicación de recordatorios simple y elegante.',
    stats: {
      lightning: 'Rápido como el rayo',
      smart: 'Recordatorios Inteligentes',
      premium: 'Sensación Premium',
    },
    footer: 'Todos los sistemas operativos',
    reminderForm: {
      title: 'Crear un Nuevo Recordatorio',
      labels: {
        title: 'Título',
        date: 'Fecha',
        time: 'Hora',
        repeat: 'Repetir',
      },
      repeatOptions: {
        none: 'Ninguno',
        daily: 'Diario',
        weekly: 'Semanal',
        monthly: 'Mensual',
      },
      submitButton: 'Añadir Recordatorio',
      successMessage: '¡Recordatorio creado con éxito!',
      errorMessages: {
        allFieldsRequired: 'Todos los campos son obligatorios.',
        failedToCreate: 'Error al crear el recordatorio.',
      },
    },
    reminderList: {
      title: 'Tus Recordatorios',
      loading: 'Cargando recordatorios...',
      noReminders: 'Aún no tienes recordatorios.',
      markAsComplete: 'Completar',
      markAsIncomplete: 'Deshacer',
      deleteButton: 'Eliminar',
      errorMessages: {
        failedToFetch: 'Error al cargar los recordatorios.',
        failedToUpdate: 'Error al actualizar el recordatorio.',
        failedToDelete: 'Error al eliminar el recordatorio.',
      },
    },
  },
};

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  texts: typeof texts.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    texts: texts[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
