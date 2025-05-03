'use client';

import React, { useCallback } from 'react';

interface UploadBoxProps {
  onUpload: (url: string, file: File) => void;
  loading?: boolean;
}

export default function UploadBox({ onUpload, loading = false }: UploadBoxProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpload(url, file);
    }
  }, [onUpload]);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdb,.json"
        disabled={loading}
      />
      
      <label
        htmlFor="file-upload"
        className={`inline-block px-5 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Analyzing...' : 'Select File'}
      </label>
      
      <p className="text-gray-600 text-sm mt-4">
        Drag and drop your .pdb or .json file here
      </p>
      
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}