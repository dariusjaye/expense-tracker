"use client";

import { useState } from 'react';
import { processReceipt, VeryfiReceiptData } from '@/lib/veryfi/veryfiClient';
import { convertVeryfiDataToExpense } from '@/lib/utils/expenseUtils';

interface ReceiptUploaderProps {
  onReceiptProcessed: (receiptData: VeryfiReceiptData) => void;
  isProcessing?: boolean;
}

export default function ReceiptUploader({ onReceiptProcessed, isProcessing = false }: ReceiptUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFile(selectedFile);
  };

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    
    // Check if file is an image or PDF
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setError('Please upload an image or PDF file (JPEG, PNG, PDF, etc.)');
      setErrorDetails(null);
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      setErrorDetails('Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setErrorDetails(null);
    
    // Create preview for images only
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, show a PDF icon instead
      setPreview(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessReceipt = async () => {
    if (!file) {
      setError('Please select a receipt image to upload');
      setErrorDetails(null);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setSuccessMessage(null);
    setWarnings([]);

    try {
      const receiptData = await processReceipt(file);
      
      // Check if the API returned valid data
      if (!receiptData || !receiptData.id) {
        setError('The receipt could not be processed');
        setErrorDetails('The API returned an empty or invalid response. Please try a different image with clearer text.');
        return;
      }
      
      // Collect warnings about potentially incomplete data
      const newWarnings = [];
      
      // Check if total amount was extracted
      if (receiptData.total === 0 || receiptData.total === undefined) {
        setError('Could not extract total amount from receipt');
        setErrorDetails('The system could not identify the total amount on your receipt. Please ensure the total is clearly visible or enter the expense details manually.');
        return;
      }
      
      // Check for missing or incomplete data
      if (!receiptData.vendor?.name || receiptData.vendor.name === 'Unknown Vendor') {
        newWarnings.push('Vendor name could not be detected. Please enter it manually.');
      }
      
      if (!receiptData.date) {
        newWarnings.push('Receipt date could not be detected. Today\'s date has been used as default.');
      }
      
      if (!receiptData.items || receiptData.items.length === 0) {
        newWarnings.push('Line items could not be detected. You may need to enter them manually.');
      }
      
      if (newWarnings.length > 0) {
        setWarnings(newWarnings);
        setSuccessMessage('Receipt processed with some missing information. Please review and complete the form.');
      } else {
        setSuccessMessage('Receipt processed successfully!');
      }
      
      onReceiptProcessed(receiptData);
    } catch (err: any) {
      console.error('Error processing receipt:', err);
      
      // Set a more specific error message based on the error
      if (err.message && err.message.includes('Veryfi API error')) {
        const statusMatch = err.message.match(/Veryfi API error: (\d+)/);
        const status = statusMatch ? statusMatch[1] : 'unknown';
        
        switch (status) {
          case '400':
            setError('Invalid request to the OCR service');
            setErrorDetails('The image format may not be supported or the request was malformed. Try a different image format (JPEG or PNG recommended).');
            break;
          case '401':
          case '403':
            setError('Authentication error with the OCR service');
            setErrorDetails('There may be an issue with the API credentials. Please contact support.');
            break;
          case '429':
            setError('Too many requests to the OCR service');
            setErrorDetails('The API rate limit has been exceeded. Please try again later.');
            break;
          case '500':
          case '502':
          case '503':
          case '504':
            setError('The OCR service is currently unavailable');
            setErrorDetails('There is an issue with the Veryfi API. Please try again later or contact support if the problem persists.');
            break;
          default:
            setError('Failed to process receipt');
            setErrorDetails(err.message || 'An unexpected error occurred. Please try again or use a different image.');
        }
      } else if (err.message && err.message.includes('credentials not found')) {
        setError('API configuration error');
        setErrorDetails('The Veryfi API credentials are not properly configured. Please contact support.');
      } else {
        setError('Failed to process receipt');
        setErrorDetails('The image could not be processed. Try using a clearer image with good lighting and make sure the receipt text is visible.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="mb-4">
            <img 
              src={preview} 
              alt="Receipt preview" 
              className="max-h-64 mx-auto rounded-md shadow-sm" 
            />
          </div>
        ) : file && file.type === 'application/pdf' ? (
          <div className="mb-4 flex flex-col items-center">
            <svg 
              className="h-16 w-16 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">PDF Document</p>
          </div>
        ) : (
          <div className="py-4">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop a receipt image or PDF, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              For best results, use a well-lit, clear image or a properly scanned PDF
            </p>
          </div>
        )}

        <input
          type="file"
          id="receipt-upload"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
          <label 
            htmlFor="receipt-upload" 
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            {file ? 'Change Image' : 'Select Image'}
          </label>
          
          {file && (
            <button
              onClick={handleProcessReceipt}
              disabled={loading || isProcessing}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                loading || isProcessing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading || isProcessing ? 'Processing...' : 'Process Receipt'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
          {errorDetails && (
            <p className="mt-1 text-xs text-red-500">
              {errorDetails}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-600">
            <p>Tips for successful receipt scanning:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              {file?.type === 'application/pdf' ? (
                <>
                  <li>Ensure the PDF contains clear, readable text</li>
                  <li>Make sure the PDF is not password protected</li>
                  <li>Use PDFs with searchable text rather than scanned images when possible</li>
                  <li>Keep the PDF file size under 10MB</li>
                </>
              ) : (
                <>
                  <li>Ensure the receipt is on a contrasting background</li>
                  <li>Make sure all text is clearly visible and not blurry</li>
                  <li>Avoid shadows and glare on the receipt</li>
                  <li>Capture the entire receipt in the image</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {successMessage && !error && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-600">
            {successMessage}
          </p>
          
          {warnings.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-amber-600">Warnings:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-amber-600">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 