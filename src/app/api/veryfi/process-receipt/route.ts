import { NextRequest, NextResponse } from 'next/server';

// Function to generate a short description based on receipt items
function generateReceiptDescription(data: any): string {
  // Get the vendor name
  const vendorName = data.vendor?.name || 'Unknown Vendor';
  
  // Get the line items
  const lineItems = data.line_items || [];
  
  // If there are no items, return a simple description
  if (!lineItems.length) {
    return `Receipt from ${vendorName}`;
  }
  
  // Get the top 3 most expensive items
  const topItems = [...lineItems]
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .slice(0, 3)
    .map(item => item.description)
    .filter(Boolean);
  
  // Create a description based on the number of items
  if (topItems.length === 0) {
    return `Receipt from ${vendorName}`;
  } else if (topItems.length === 1) {
    return `${vendorName}: ${topItems[0]}`;
  } else if (topItems.length === 2) {
    return `${vendorName}: ${topItems[0]} and ${topItems[1]}`;
  } else {
    return `${vendorName}: ${topItems[0]}, ${topItems[1]}, and ${lineItems.length > 3 ? `${lineItems.length - 3} more items` : topItems[2]}`;
  }
}

// Process receipt image or PDF through Veryfi API
export async function POST(request: NextRequest) {
  try {
    // Get credentials from environment variables
    const clientId = process.env.VERYFI_CLIENT_ID;
    const username = process.env.VERYFI_USERNAME;
    const apiKey = process.env.VERYFI_API_KEY;
    const apiUrl = process.env.VERYFI_URL || 'https://api.veryfi.com/api/v8/partner/documents';
    
    // Log credentials status (without revealing actual values)
    console.log('Veryfi API credentials check:', {
      clientId: clientId ? 'Present' : 'Missing',
      username: username ? 'Present' : 'Missing',
      apiKey: apiKey ? 'Present' : 'Missing',
      apiUrl: apiUrl
    });
    
    if (!clientId || !username || !apiKey) {
      console.error('Veryfi API credentials not found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error', details: 'Missing API credentials' },
        { status: 500 }
      );
    }
    
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Missing file', details: 'No file was provided in the request' },
        { status: 400 }
      );
    }
    
    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      userId: userId || 'Not provided'
    });
    
    // Check if the file is a PDF and add specific parameters for PDF processing
    const isPdf = file.type === 'application/pdf';
    
    // Create a new FormData object to ensure we're sending a clean request
    const apiFormData = new FormData();
    apiFormData.append('file', file);
    apiFormData.append('auto_delete', 'false'); // Keep the document for debugging
    apiFormData.append('boost_mode', '1'); // Enable boost mode for better accuracy
    apiFormData.append('external_id', `receipt_${Date.now()}`); // Add a unique ID for tracking
    
    // Add specific parameters for PDF processing
    if (isPdf) {
      apiFormData.append('file_name', file.name || 'receipt.pdf');
      apiFormData.append('document_type', 'receipt');
    }
    
    // Prepare headers with proper authentication
    const headers = {
      'Client-Id': clientId,
      'Authorization': `apikey ${username}:${apiKey}`,
    };
    
    console.log('Sending request to Veryfi API with headers:', {
      'Client-Id': 'REDACTED',
      'Authorization': 'REDACTED',
      'Content-Type': 'multipart/form-data'
    });
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: apiFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Veryfi API error: ${response.status} ${errorText}`);
      
      // For 401 errors, provide more specific guidance
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed', 
            details: 'The Veryfi API credentials are invalid or expired. Please check your API keys in .env.local file.' 
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Veryfi API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log the raw response for debugging (without sensitive data)
    console.log('Veryfi API response received with ID:', data.id);
    
    // Check if the response contains the expected fields
    if (!data.id || data.total === undefined) {
      console.error('Veryfi API returned incomplete data:', data);
      return NextResponse.json(
        { error: 'Incomplete data', details: 'The OCR service returned incomplete data' },
        { status: 422 }
      );
    }
    
    // Generate a description based on the receipt items if notes are not provided
    const generatedDescription = generateReceiptDescription(data);
    
    // Transform the API response to match our interface
    const processedData = {
      id: data.id,
      userId: userId || undefined, // Include userId if provided from mobile upload
      vendor: {
        name: data.vendor?.name || 'Unknown Vendor',
        address: data.vendor?.address || '',
        phone_number: data.vendor?.phone_number,
      },
      date: data.date || new Date().toISOString().split('T')[0],
      total: typeof data.total === 'number' ? data.total : 0,
      subtotal: data.subtotal,
      tax: data.tax,
      tip: data.tip,
      currency: data.currency_code || 'USD',
      payment_method: data.payment?.type,
      items: data.line_items?.map((item: any) => ({
        description: item.description || 'Item',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
      category: data.category,
      notes: data.notes || generatedDescription, // Use generated description if no notes are provided
      ocr_text: data.ocr_text,
      receipt_url: data.thumbnail || data.img_url || data.img_thumbnail_url,
      source: userId ? 'mobile' : 'web', // Track the source of the upload
    };
    
    console.log('Successfully processed receipt data');
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error processing receipt:', error);
    
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 