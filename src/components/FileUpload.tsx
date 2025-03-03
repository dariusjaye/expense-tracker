import { useState, useRef } from 'react';

interface FileUploadProps {
  label: string;
  onFileLoaded: (content: string) => void;
  accept?: string;
}

export default function FileUpload({ label, onFileLoaded, accept = '.csv' }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onFileLoaded(content);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to read file. Please try again.');
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col">
        <label className="mb-2 font-medium text-gray-700">{label}</label>
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Choose File'}
          </button>
          {fileName && (
            <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
              {fileName}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
} 