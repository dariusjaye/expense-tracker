import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, addDoc, query, limit, Firestore } from 'firebase/firestore';

export async function GET() {
  try {
    // Check if db is a valid Firestore instance
    if (!db || Object.keys(db).length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Firestore is not properly initialized',
      }, { status: 500 });
    }

    // Use a public_data collection that allows unauthenticated access
    // This is useful for testing if Firestore is working
    const publicCollectionRef = collection(db as Firestore, 'public_data');
    
    // Try to get documents from the collection
    const q = query(publicCollectionRef, limit(5));
    const snapshot = await getDocs(q);
    
    // Check if we have any documents
    if (snapshot.empty) {
      // If no documents exist, create a test document
      await addDoc(publicCollectionRef, {
        message: 'Test document',
        timestamp: Date.now()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'No documents found, created a test document' 
      });
    }
    
    // Return the documents
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firestore is working correctly',
      documents 
    });
  } catch (error) {
    console.error('Error testing Firestore:', error);
    
    // Check if this is a permission-denied error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('permission-denied')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Firestore permission denied. Check your security rules.',
        error: errorMessage
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Firestore',
      error: errorMessage
    }, { status: 500 });
  }
} 