"use client";

import { createContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, signInAnonymously } from 'firebase/auth';

// Define a simple user type without Firebase dependencies
interface SimpleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signOut: () => void;
  signInWithPin: (pin: string) => Promise<boolean>;
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  signInWithPin: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to SimpleUser
        const simpleUser: SimpleUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(simpleUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const signInWithPin = async (pin: string): Promise<boolean> => {
    if (pin === '1996') {
      try {
        // Use anonymous authentication with Firebase
        const userCredential = await signInAnonymously(auth);
        return true;
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        return false;
      }
    }
    return false;
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithPin }}>
      {children}
    </AuthContext.Provider>
  );
}
