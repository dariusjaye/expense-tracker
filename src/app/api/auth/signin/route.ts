import { NextRequest, NextResponse } from 'next/server';
import { signInAnonymously, Auth } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;
    
    if (pin !== '1996') {
      return NextResponse.json(
        { success: false, message: 'Invalid PIN' },
        { status: 401 }
      );
    }
    
    // Check if auth is initialized
    if (!auth) {
      throw new Error('Firebase auth is not properly initialized');
    }
    
    // Use anonymous authentication with Firebase
    const userCredential = await signInAnonymously(auth as Auth);
    
    return NextResponse.json({
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      }
    });
  } catch (error) {
    console.error('Error signing in:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed', error: String(error) },
      { status: 500 }
    );
  }
} 