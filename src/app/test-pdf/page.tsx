'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Send to our API
      const response = await fetch('/api/veryfi/process-receipt', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to process receipt');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">PDF to JPEG Conversion Test</h1>
      <p className="mb-6 text-gray-600">
        Upload a PDF receipt to test the conversion to JPEG and Veryfi OCR processing.
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>
            Select a PDF or image file to process with Veryfi OCR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="file" className="block text-sm font-medium">
                Receipt File (PDF or Image)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90"
              />
              {file && (
                <p className="text-sm text-gray-500">
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={!file || isLoading}>
                {isLoading ? 'Processing...' : 'Process Receipt'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt Data</CardTitle>
            <CardDescription>
              Data extracted from the receipt using Veryfi OCR
              {result.original_file_type && (
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  Original file: {result.original_file_type}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Receipt Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">Vendor:</dt>
                    <dd>{result.vendor?.name || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Date:</dt>
                    <dd>{result.date || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Total:</dt>
                    <dd>${result.total?.toFixed(2) || '0.00'}</dd>
                  </div>
                  {result.subtotal !== undefined && (
                    <div className="flex justify-between">
                      <dt className="font-medium">Subtotal:</dt>
                      <dd>${result.subtotal?.toFixed(2)}</dd>
                    </div>
                  )}
                  {result.tax !== undefined && (
                    <div className="flex justify-between">
                      <dt className="font-medium">Tax:</dt>
                      <dd>${result.tax?.toFixed(2)}</dd>
                    </div>
                  )}
                  {result.category && (
                    <div className="flex justify-between">
                      <dt className="font-medium">Category:</dt>
                      <dd>{result.category}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              {result.items && result.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Line Items</h3>
                  <ul className="space-y-2">
                    {result.items.map((item: any, index: number) => (
                      <li key={index} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span>{item.description || 'Item'}</span>
                          <span>${item.total?.toFixed(2) || '0.00'}</span>
                        </div>
                        {item.quantity && (
                          <div className="text-sm text-gray-500">
                            Qty: {item.quantity} × ${item.unit_price?.toFixed(2) || '0.00'}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {result.receipt_url && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Receipt Image</h3>
                <div className="border rounded-md p-2 bg-gray-50">
                  <img 
                    src={result.receipt_url} 
                    alt="Receipt" 
                    className="max-w-full h-auto max-h-96 mx-auto"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Raw Data</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 