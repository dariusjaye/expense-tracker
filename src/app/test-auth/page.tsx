'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getVendors, addVendor } from '@/lib/firebase/expenseDb';

export default function TestAuthPage() {
  const { user, loading, signInWithPin } = useAuth();
  const [pin, setPin] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVendors();
    }
  }, [user]);

  async function fetchVendors() {
    if (!user) return;
    
    try {
      console.log('Fetching vendors for user:', user.uid);
      const fetchedVendors = await getVendors(user.uid);
      console.log('Fetched vendors:', fetchedVendors);
      setVendors(fetchedVendors);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(`Failed to load vendors: ${error.message}`);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await signInWithPin(pin);
      if (!success) {
        setError('Invalid PIN');
      } else {
        setError(null);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setError(`Error signing in: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddTestVendor() {
    if (!user) return;
    
    setIsAddingVendor(true);
    try {
      const testVendor = {
        name: `Test Vendor ${Date.now()}`,
        address: '123 Test Street',
        phone: '555-123-4567',
        email: 'test@example.com',
        category: 'Office Supplies',
        notes: 'This is a test vendor',
      };
      
      console.log('Adding test vendor for user:', user.uid);
      const newVendor = await addVendor(user.uid, testVendor);
      console.log('Added test vendor:', newVendor);
      
      // Refresh vendors list
      await fetchVendors();
      setError(null);
    } catch (error: any) {
      console.error('Error adding test vendor:', error);
      setError(`Failed to add test vendor: ${error.message}`);
    } finally {
      setIsAddingVendor(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Authentication</h1>
        <p className="text-gray-600">Test signing in and fetching vendors</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : user ? (
        <div>
          <div className="bg-green-100 p-4 rounded-md mb-4">
            <p className="text-green-800">Signed in as: {user.uid}</p>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <button 
              onClick={fetchVendors}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Vendors
            </button>
            
            <button 
              onClick={handleAddTestVendor}
              disabled={isAddingVendor}
              className={`px-4 py-2 text-white rounded-md ${
                isAddingVendor
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isAddingVendor ? 'Adding...' : 'Add Test Vendor'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 p-4 rounded-md mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <div className="bg-white shadow-sm rounded-md overflow-hidden">
            <h2 className="text-xl font-bold p-4 border-b">Vendors ({vendors.length})</h2>
            {vendors.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No vendors found.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <li key={vendor.id} className="p-4">
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-gray-500">{vendor.id}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>
          <form onSubmit={handleSignIn} className="max-w-md mx-auto">
            <div className="mb-4">
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                Enter PIN
              </label>
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-100 p-4 rounded-md mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 