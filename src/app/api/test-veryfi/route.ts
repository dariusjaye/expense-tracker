import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Veryfi API credentials are set
    const clientId = process.env.VERYFI_CLIENT_ID;
    const clientSecret = process.env.VERYFI_CLIENT_SECRET;
    const username = process.env.VERYFI_USERNAME;
    const apiKey = process.env.VERYFI_API_KEY;
    
    // Validate credentials
    const missingCredentials = [];
    if (!clientId) missingCredentials.push('VERYFI_CLIENT_ID');
    if (!clientSecret) missingCredentials.push('VERYFI_CLIENT_SECRET');
    if (!username) missingCredentials.push('VERYFI_USERNAME');
    if (!apiKey) missingCredentials.push('VERYFI_API_KEY');
    
    if (missingCredentials.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Missing Veryfi API credentials',
        missingCredentials
      }, { status: 500 });
    }
    
    // Make a simple request to Veryfi API to check if credentials are valid
    // We'll use the categories endpoint as it's lightweight
    const url = 'https://api.veryfi.com/api/v8/categories/';
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Client-Id': clientId as string,
      'Authorization': `apikey ${username}:${apiKey}`
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        message: 'Veryfi API request failed',
        status: response.status,
        error: errorText
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Veryfi API is working correctly',
      categories: data
    });
  } catch (error) {
    console.error('Error testing Veryfi API:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      message: 'Error testing Veryfi API',
      error: errorMessage
    }, { status: 500 });
  }
} 