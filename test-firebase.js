// Test script to verify Firebase database connection
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, limit } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('Firebase config loaded:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'set' : 'not set',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'set' : 'not set',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'set' : 'not set',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'set' : 'not set',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'set' : 'not set',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'set' : 'not set',
});

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Sign in anonymously first
    console.log('Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('Signed in anonymously with user ID:', user.uid);
    
    // Test collection access
    const testCollection = collection(db, 'test_connection');
    
    // Add a test document
    const testDoc = {
      message: 'Test connection successful',
      timestamp: new Date().toISOString(),
      userId: user.uid // Include the user ID for security rules
    };
    
    const docRef = await addDoc(testCollection, testDoc);
    console.log('Test document written with ID:', docRef.id);
    
    // Query the test document
    const q = query(
      collection(db, 'test_connection'), 
      where('userId', '==', user.uid),
      where('message', '==', 'Test connection successful'), 
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No matching documents found.');
    } else {
      console.log('Document found:');
      querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
      });
    }
    
    console.log('Firebase connection test completed successfully!');
  } catch (error) {
    console.error('Error testing Firebase connection:', error);
  }
}

// Run the test
testFirebaseConnection(); 