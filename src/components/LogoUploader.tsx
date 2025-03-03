"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/contexts/AppContext';

export default function LogoUploader() {
  const { settings, uploadLogo, setLogoUrl, isLoading: contextLoading } = useApp();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview from settings when component mounts or settings change
  useEffect(() => {
    if (settings.logoUrl) {
      setPreviewUrl(settings.logoUrl);
    }
  }, [settings.logoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setUploadError(null);
    setUploadSuccess(false);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size should be less than 2MB');
      return;
    }

    // Create a preview immediately for better UX
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Start upload
    setIsUploading(true);

    try {
      // Upload the file
      const url = await uploadLogo(file);
      
      // Set success state
      setUploadSuccess(true);
      setIsUploading(false);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadError('Failed to upload logo. Please try again.');
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear the preview
    setPreviewUrl(null);
    
    // Clear the logo URL in the context
    setLogoUrl(null);
    
    // Reset states
    setUploadSuccess(false);
    setUploadError(null);
  };

  // Determine if buttons should be disabled
  const isDisabled = isUploading || contextLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700">Company Logo</h3>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="text-red-600 hover:text-red-800 text-sm"
            disabled={isDisabled}
          >
            Remove Logo
          </button>
        )}
      </div>

      {/* Logo preview area */}
      {previewUrl ? (
        <div className="relative w-48 h-48 border rounded-md overflow-hidden">
          <Image
            src={previewUrl}
            alt="Company Logo"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      ) : (
        <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
          <span className="text-gray-500 text-sm text-center px-4">
            No logo uploaded
          </span>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="text-red-600 text-sm">{uploadError}</div>
      )}

      {/* Success message */}
      {uploadSuccess && (
        <div className="text-green-600 text-sm">Logo uploaded successfully and saved to database!</div>
      )}

      {/* Upload button */}
      <div className="pt-2">
        <label className={`btn ${isDisabled ? 'btn-disabled' : 'btn-primary'} cursor-pointer inline-block`}>
          {isUploading ? 'Uploading...' : contextLoading ? 'Loading...' : 'Upload Logo'}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isDisabled}
            ref={fileInputRef}
          />
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Recommended: Square image, PNG or JPG, max 2MB
        </p>
      </div>
    </div>
  );
} 