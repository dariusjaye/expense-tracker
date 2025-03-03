import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Suppress the heartbeats warning
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('heartbeat')) {
    return;
  }
  originalConsoleError(...args);
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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

// Validate Firebase config
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId && 
  firebaseConfig.storageBucket && 
  firebaseConfig.messagingSenderId && 
  firebaseConfig.appId;

if (!isConfigValid) {
  console.error('Firebase configuration is incomplete. Check your environment variables.');
}

// Initialize Firebase
let app: any;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  // Initialize Firebase only if all config values are present
  if (isConfigValid) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    // Initialize with mock objects for static build
    app = {};
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: () => Promise.resolve(),
    } as unknown as Auth;
    db = {
      collection: () => ({
        add: () => Promise.resolve({ id: 'mock-id' }),
        get: () => Promise.resolve({ docs: [] }),
      }),
    } as unknown as Firestore;
    storage = {
      ref: () => ({
        put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
      }),
    } as unknown as FirebaseStorage;
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Initialize with mock objects as fallbacks
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
  } as unknown as Auth;
  db = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      get: () => Promise.resolve({ docs: [] }),
    }),
  } as unknown as Firestore;
  storage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
    }),
  } as unknown as FirebaseStorage;
}

export { app, auth, db, storage };
