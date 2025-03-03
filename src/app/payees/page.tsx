"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import VendorManager from '@/components/VendorManager';
import { Vendor } from '@/lib/utils/expenseUtils';
import { getVendors, addVendor, updateVendor, deleteVendor } from '@/lib/firebase/expenseDb';

export default function VendorsPage() {
  const { user, loading } = useAuth();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch vendors when user is authenticated
  useEffect(() => {
    if (user) {
      fetchVendors();
    }
  }, [user]);
  
  const fetchVendors = async () => {
    if (!user) return;
    
    try {
      const fetchedVendors = await getVendors(user.uid);
      setVendors(fetchedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  
  const handleAddVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const newVendor = await addVendor(user.uid, vendorData);
      setVendors([...vendors, newVendor]);
    } catch (error) {
      console.error('Error adding vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateVendor = async (vendorId: string, vendorData: Partial<Vendor>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateVendor(vendorId, vendorData);
      
      // Update local state
      setVendors(vendors.map(vendor => 
        vendor.id === vendorId
          ? { ...vendor, ...vendorData, updatedAt: Date.now() }
          : vendor
      ));
    } catch (error) {
      console.error('Error updating vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteVendor = async (vendorId: string) => {
    if (!user) return;
    
    try {
      await deleteVendor(vendorId);
      setVendors(vendors.filter(vendor => vendor.id !== vendorId));
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };
  
  // If user is not authenticated or loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendors</h1>
        <p className="text-lg text-gray-600 mb-8">
          Please sign in to view and manage your vendors.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 mb-6">
          Manage your vendors to quickly select them when adding expenses. You can also set default categories for each vendor.
        </p>
        
        <VendorManager
          vendors={vendors}
          onAddVendor={handleAddVendor}
          onUpdateVendor={handleUpdateVendor}
          onDeleteVendor={handleDeleteVendor}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 