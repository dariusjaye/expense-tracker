"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

// Add dynamic export configuration
export const dynamic = 'force-dynamic';

// Add generateStaticParams for static export
export async function generateStaticParams() {
  // Since this is a mobile upload page that needs to handle any user ID,
  // we'll generate a few example paths and handle the rest on the client
  return [
    { userId: 'example1' },
    { userId: 'example2' },
    { userId: 'example3' },
  ];
}

export default function MobileUploadPage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Clear any previous states when component mounts
  useEffect(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
  }, []);
  
  // Generate preview when file is selected
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    
    if (file.type === 'application/pdf') {
      // For PDFs, just show a PDF icon
      setPreview('/pdf-icon.png');
      return;
    }
    
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a valid image (JPEG, PNG, HEIC) or PDF file.');
      setFile(null);
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !userId) {
      setError('Please select a file to upload.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await fetch('/api/veryfi/process-receipt', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process receipt');
      }
      
      setSuccess(true);
      setFile(null);
      setPreview(null);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Mobile Receipt Upload</h1>
        <p className="text-sm text-gray-600">Upload your receipt directly from your phone</p>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-start">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <label 
              htmlFor="file-upload" 
              className="block w-full cursor-pointer"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                {preview ? (
                  <div className="flex justify-center mb-2">
                    <Image 
                      src={preview} 
                      alt="Preview" 
                      width={200} 
                      height={200} 
                      className="max-h-48 object-contain" 
                    />
                  </div>
                ) : (
                  <div className="py-8">
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
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-2">
                  {file ? file.name : 'Tap to select a receipt image or PDF'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, HEIC, PDF (max 10MB)
                </p>
              </div>
              <input 
                id="file-upload" 
                name="file" 
                type="file" 
                accept="image/jpeg,image/png,image/heic,application/pdf" 
                className="hidden" 
                onChange={handleFileChange}
                capture="environment"
              />
            </label>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              Receipt uploaded and processed successfully!
            </div>
          )}
          
          <button
            type="submit"
            disabled={!file || isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              !file || isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Upload Receipt'
            )}
          </button>
        </form>
      </main>
      
      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>This upload is linked to your account. All receipts will be processed automatically.</p>
      </footer>
    </div>
  );
} 