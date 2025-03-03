"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/hooks/useAuth';

interface MobileUploadQRProps {
  className?: string;
}

export default function MobileUploadQR({ className = '' }: MobileUploadQRProps) {
  const { user } = useAuth();
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (user) {
      // Create a unique upload URL with the user's ID
      const baseUrl = window.location.origin;
      const uploadPath = `/mobile-upload/${user.uid}`;
      setUploadUrl(`${baseUrl}${uploadPath}`);
    }
  }, [user]);

  const handleCopyLink = () => {
    if (uploadUrl) {
      navigator.clipboard.writeText(uploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  if (!user || !uploadUrl) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={toggleQR}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
          />
        </svg>
        Mobile Upload
      </button>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload from Mobile</h3>
              <button 
                onClick={toggleQR} 
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg mb-4">
                <QRCodeSVG 
                  value={uploadUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                Scan this QR code with your mobile device to upload receipts directly from your phone.
              </p>
              
              <div className="flex items-center justify-between w-full bg-gray-100 rounded-md p-2 mb-4">
                <span className="text-xs text-gray-600 truncate mr-2 max-w-[180px]">
                  {uploadUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                This link is unique to your account. Don&apos;t share it with others.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 