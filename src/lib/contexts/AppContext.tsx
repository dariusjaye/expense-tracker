"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { uploadFile } from '@/lib/firebase/firebaseUtils';
import { addDocument, updateDocument, getDocuments } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';

// Define the shape of our app settings
interface AppSettings {
  logoUrl: string | null;
}

// Define the shape of a Firestore document
interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

// Define the context type
interface AppContextType {
  settings: AppSettings;
  isLoading: boolean;
  uploadLogo: (file: File) => Promise<string>;
  setLogoUrl: (url: string | null) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Default settings
const defaultSettings: AppSettings = {
  logoUrl: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsDocId, setSettingsDocId] = useState<string | null>(null);

  // Load settings from Firestore and localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from localStorage first for immediate display
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // Then load from Firestore for the most up-to-date settings
        const settingsDocs = await getDocuments('appSettings');
        
        if (settingsDocs.length > 0) {
          // Use the first settings document found
          const settingsDoc = settingsDocs[0] as FirestoreDocument;
          setSettingsDocId(settingsDoc.id);
          
          // Extract the settings data and ensure it has the correct type
          const firestoreSettings: AppSettings = {
            logoUrl: settingsDoc.logoUrl || null
          };
          
          setSettings(firestoreSettings);
          
          // Update localStorage with the Firestore data
          localStorage.setItem('appSettings', JSON.stringify(firestoreSettings));
        } else if (savedSettings) {
          // If we have settings in localStorage but not in Firestore, save to Firestore
          const parsedSettings = JSON.parse(savedSettings);
          const newDoc = await addDocument('appSettings', parsedSettings);
          setSettingsDocId(newDoc.id);
        } else {
          // If no settings found anywhere, create a new document in Firestore
          const newDoc = await addDocument('appSettings', defaultSettings);
          setSettingsDocId(newDoc.id);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to Firestore whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      if (isLoading) return;
      
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Save to Firestore if we have a document ID
      if (settingsDocId) {
        try {
          await updateDocument('appSettings', settingsDocId, settings);
        } catch (error) {
          console.error('Error saving settings to Firestore:', error);
        }
      } else {
        // If we don't have a document ID yet, create a new document
        try {
          const newDoc = await addDocument('appSettings', settings);
          setSettingsDocId(newDoc.id);
        } catch (error) {
          console.error('Error creating settings in Firestore:', error);
        }
      }
    };
    
    // Use a timeout to debounce frequent updates
    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [settings, isLoading, settingsDocId]);

  // Function to upload a logo
  const uploadLogo = async (file: File): Promise<string> => {
    try {
      setIsLoading(true);
      
      // Upload to Firebase Storage
      const path = `logos/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      // Update settings with the new URL
      setSettings(prev => ({
        ...prev,
        logoUrl: url
      }));
      
      return url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set logo URL directly
  const setLogoUrl = (url: string | null) => {
    setSettings(prev => ({
      ...prev,
      logoUrl: url
    }));
  };

  const value = {
    settings,
    isLoading,
    uploadLogo,
    setLogoUrl
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 