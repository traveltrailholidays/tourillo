'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ItineraryImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Get presigned URL
      const response = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      onChange(fileUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full h-48 rounded overflow-hidden border-2 border-gray-300 dark:border-gray-700">
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded cursor-pointer transition ${
            disabled
              ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-gray-900'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={disabled || isUploading}
          />
        </label>
      )}
    </div>
  );
}
