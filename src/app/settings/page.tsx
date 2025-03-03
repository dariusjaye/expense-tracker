"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import LogoUploader from '@/components/LogoUploader';

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    setUpdateMessage({ type: '', message: '' });
    
    try {
      // Simulate profile update with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, we would update the user profile in the database
      // For now, we'll just show a success message
      
      setUpdateMessage({
        type: 'success',
        message: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600 mb-4">Please sign in to access your settings.</p>
        <p className="text-sm text-gray-500">Use the PIN code: 1996</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      {/* Company Logo Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Logo</h2>
        <p className="text-gray-600 mb-4">
          Upload your company logo to be displayed in the navigation and other parts of the app.
        </p>
        <LogoUploader />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>
        
        {updateMessage.message && (
          <div className={`p-4 mb-4 rounded-md ${
            updateMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {updateMessage.message}
          </div>
        )}
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="border rounded-md px-3 py-2 w-full bg-gray-100"
              value={user.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              className="border rounded-md px-3 py-2 w-full"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>
        <p className="text-gray-600 mb-4">
          Manage your account settings and preferences.
        </p>
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">
          This application is using a simple PIN-based authentication system.
        </p>
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">
            <strong>PIN Code:</strong> 1996
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            This is for demonstration purposes only. In a real application, you would use a more secure authentication method.
          </p>
        </div>
      </div>
    </div>
  );
} 