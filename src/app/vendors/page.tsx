'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import VendorManager from '@/components/VendorManager';
import { Vendor } from '@/lib/utils/expenseUtils';
import { getVendors, addVendor, updateVendor, deleteVendor } from '@/lib/firebase/expenseDb';

export default function VendorsPage() {
  const { user, loading } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching vendors for:', user.uid);
      fetchVendors();
    }
  }, [user]);

  async function fetchVendors() {
    if (!user) return;
    
    try {
      console.log('Starting to fetch vendors for user:', user.uid);
      const fetchedVendors = await getVendors(user.uid);
      console.log('Successfully fetched vendors:', fetchedVendors);
      setVendors(fetchedVendors);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(`Failed to load vendors: ${error.message}`);
      alert('Failed to load vendors. Please try again.');
    }
  }

  async function handleAddVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      console.log('Adding vendor for user:', user.uid);
      await addVendor(user.uid, vendor);
      await fetchVendors();
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateVendor(vendorId: string, vendorData: Partial<Vendor>) {
    setIsSubmitting(true);
    try {
      await updateVendor(vendorId, vendorData);
      await fetchVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert('Failed to update vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteVendor(vendorId: string) {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await deleteVendor(vendorId);
      await fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 mb-8">You need to be signed in to manage vendors.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendors</h1>
        <p className="text-gray-600">Manage your vendors for expense tracking</p>
      </div>
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md mb-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchVendors}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      <VendorManager 
        vendors={vendors}
        onAddVendor={handleAddVendor}
        onUpdateVendor={handleUpdateVendor}
        onDeleteVendor={handleDeleteVendor}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 