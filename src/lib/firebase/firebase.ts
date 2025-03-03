import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Suppress the heartbeats warning
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('heartbeat')) {
    return;
  }
  originalConsoleError(...args);
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDHZOmC4BYlxiC1CwWBZIekqp6eHKR4PWs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'expense-tracker-demo-5b0f0.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'expense-tracker-demo-5b0f0',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'expense-tracker-demo-5b0f0.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef1234567890',
};

// Log Firebase config for debugging (without sensitive values)
console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Not set',
  authDomain: firebaseConfig.authDomain ? 'Set' : 'Not set',
  projectId: firebaseConfig.projectId ? 'Set' : 'Not set',
  storageBucket: firebaseConfig.storageBucket ? 'Set' : 'Not set',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Not set',
  appId: firebaseConfig.appId ? 'Set' : 'Not set',
});

// Initialize Firebase
let app: any;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Initialize Firebase
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable offline persistence for Firestore if in browser
  if (isBrowser) {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence.');
      }
    });
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Initialize with mock objects as fallbacks
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    signOut: () => Promise.resolve(),
  } as unknown as Auth;
  db = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      get: () => Promise.resolve({ docs: [] }),
      where: () => ({
        get: () => Promise.resolve({ docs: [] }),
      }),
      orderBy: () => ({
        get: () => Promise.resolve({ docs: [] }),
      }),
    }),
  } as unknown as Firestore;
  storage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
      getDownloadURL: () => Promise.resolve(''),
    }),
  } as unknown as FirebaseStorage;
}

export { app, auth, db, storage };
