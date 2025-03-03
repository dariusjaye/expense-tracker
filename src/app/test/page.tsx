'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestPage() {
  const [firestoreResult, setFirestoreResult] = useState<any>(null);
  const [firestoreLoading, setFirestoreLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  
  const [veryfiResult, setVeryfiResult] = useState<any>(null);
  const [veryfiLoading, setVeryfiLoading] = useState(false);
  const [veryfiError, setVeryfiError] = useState<string | null>(null);
  
  const testFirestore = async () => {
    setFirestoreLoading(true);
    setFirestoreError(null);
    setFirestoreResult(null);
    
    try {
      const response = await fetch('/api/test-firestore');
      const data = await response.json();
      setFirestoreResult(data);
      
      if (!data.success) {
        setFirestoreError(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error testing Firestore:', error);
      setFirestoreError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setFirestoreLoading(false);
    }
  };
  
  const testVeryfi = async () => {
    setVeryfiLoading(true);
    setVeryfiError(null);
    setVeryfiResult(null);
    
    try {
      const response = await fetch('/api/test-veryfi');
      const data = await response.json();
      setVeryfiResult(data);
      
      if (!data.success) {
        setVeryfiError(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error testing Veryfi:', error);
      setVeryfiError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setVeryfiLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      <p className="mb-6 text-gray-600">
        Use this page to test if your API routes are working correctly.
      </p>
      
      <Tabs defaultValue="firestore">
        <TabsList className="mb-4">
          <TabsTrigger value="firestore">Firestore</TabsTrigger>
          <TabsTrigger value="veryfi">Veryfi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="firestore">
          <Card>
            <CardHeader>
              <CardTitle>Test Firestore Connection</CardTitle>
              <CardDescription>
                This will test if your Firestore database is properly configured and accessible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testFirestore} 
                disabled={firestoreLoading}
                className="mb-4"
              >
                {firestoreLoading ? 'Testing...' : 'Test Firestore'}
              </Button>
              
              {firestoreError && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                  <p className="font-semibold">Error:</p>
                  <p>{firestoreError}</p>
                </div>
              )}
              
              {firestoreResult && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Result:</h3>
                  <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(firestoreResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="veryfi">
          <Card>
            <CardHeader>
              <CardTitle>Test Veryfi API</CardTitle>
              <CardDescription>
                This will test if your Veryfi API credentials are properly configured and working.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testVeryfi} 
                disabled={veryfiLoading}
                className="mb-4"
              >
                {veryfiLoading ? 'Testing...' : 'Test Veryfi API'}
              </Button>
              
              {veryfiError && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                  <p className="font-semibold">Error:</p>
                  <p>{veryfiError}</p>
                </div>
              )}
              
              {veryfiResult && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Result:</h3>
                  <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(veryfiResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 