// Veryfi API client for OCR receipt processing
// Documentation: https://www.veryfi.com/api/

export interface VeryfiCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  apiKey: string;
}

export interface VeryfiReceiptData {
  id: string;
  vendor: {
    name: string;
    address: string;
    phone_number?: string;
  };
  date: string;
  total: number;
  subtotal?: number;
  tax?: number;
  tip?: number;
  currency: string;
  payment_method?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    unit_price?: number;
    total?: number;
  }>;
  category?: string;
  notes?: string;
  ocr_text?: string;
  receipt_url?: string;
  file_type?: string;
}

export class VeryfiApiError extends Error {
  status: number;
  responseText: string;

  constructor(status: number, responseText: string) {
    super(`Veryfi API error: ${status} ${responseText}`);
    this.name = 'VeryfiApiError';
    this.status = status;
    this.responseText = responseText;
  }
}

export async function processReceipt(
  file: File,
  categories: string[] = []
): Promise<VeryfiReceiptData> {
  try {
    // Detect file type
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    if (!isImage && !isPdf) {
      throw new Error('Unsupported file type. Please upload an image or PDF file.');
    }
    
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    if (categories.length > 0) {
      formData.append('categories', categories.join(','));
    }
    
    // Call our server-side API route instead of Veryfi directly
    const response = await fetch('/api/veryfi/process-receipt', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorText = errorData?.details || await response.text() || 'Unknown error';
      throw new VeryfiApiError(response.status, errorText);
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data.id || data.total === undefined) {
      console.error('API returned incomplete data:', data);
      throw new Error('The OCR service returned incomplete data. Some required fields are missing.');
    }
    
    // Add file type information to the response
    data.file_type = isPdf ? 'pdf' : 'image';
    
    return data as VeryfiReceiptData;
  } catch (error) {
    // Re-throw VeryfiApiError instances
    if (error instanceof VeryfiApiError) {
      throw error;
    }
    
    // For network errors or other issues
    if (error instanceof Error) {
      console.error('Error processing receipt:', error);
      throw new Error(`Failed to process receipt: ${error.message}`);
    }
    
    // For unknown errors
    throw new Error('An unknown error occurred while processing the receipt');
  }
} 