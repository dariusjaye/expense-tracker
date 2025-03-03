'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBaseUrl } from '@/lib/utils/urlUtils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-2">We apologize for the inconvenience.</p>
        <p className="text-sm text-gray-500 mb-8">{error.message || 'An unexpected error occurred.'}</p>
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => {
              // Clear any stored state that might be causing issues
              localStorage.clear();
              sessionStorage.clear();
              router.push(getBaseUrl('/'));
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
} 