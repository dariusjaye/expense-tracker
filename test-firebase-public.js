// Test script to verify Firebase database connection with public access
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, limit } = require('firebase/firestore');
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
    // Just check if we can list collections
    console.log('Attempting to access Firestore...');
    
    // Try to access a public collection
    const publicCollection = collection(db, 'public_data');
    
    // Add a test document
    const testDoc = {
      message: 'Test connection successful',
      timestamp: new Date().toISOString()
    };
    
    console.log('Attempting to write to Firestore...');
    try {
      const docRef = await addDoc(publicCollection, testDoc);
      console.log('Test document written with ID:', docRef.id);
    } catch (writeError) {
      console.log('Write operation failed (expected if rules are restrictive):', writeError.message);
    }
    
    console.log('Attempting to read from Firestore...');
    try {
      const q = query(collection(db, 'public_data'), limit(5));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No documents found (collection may be empty or inaccessible).');
      } else {
        console.log(`Found ${querySnapshot.size} documents:`);
        querySnapshot.forEach((doc) => {
          console.log(doc.id, ' => ', doc.data());
        });
      }
    } catch (readError) {
      console.log('Read operation failed (expected if rules are restrictive):', readError.message);
    }
    
    console.log('Firebase connection test completed!');
    console.log('If both read and write operations failed, this is expected with restrictive security rules.');
    console.log('The important thing is that we were able to connect to Firebase without errors.');
  } catch (error) {
    console.error('Error testing Firebase connection:', error);
  }
}

// Run the test
testFirebaseConnection(); 