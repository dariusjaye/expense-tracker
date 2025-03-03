import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would get this from an environment variable
    // and implement proper authentication to protect the API key
    const apiKey = process.env.DEEPGRAM_API_KEY || 'your-deepgram-api-key';
    
    return NextResponse.json({ 
      success: true, 
      apiKey 
    });
  } catch (error) {
    console.error('Error in Deepgram API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get Deepgram API key', error: String(error) },
      { status: 500 }
    );
  }
} 