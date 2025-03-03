'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNavigationUrl } from '@/lib/utils/urlUtils';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a delay
    const timer = setTimeout(() => {
      router.push(getNavigationUrl(''));
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            404 - Page Not Found
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Redirecting to home page...
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => router.push(getNavigationUrl(''))}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to home page
          </button>
        </div>
      </div>
    </div>
  );
} 