// components/admin/edit-review-form.tsx
'use client';

import { updateReviewWithState } from '@/lib/actions/review-actions';
import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload, Trash2, FileImage, CheckCircle, Save, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import LoadingSpinner from '../loading-spinner';

interface Review {
  id: string;
  name: string;
  review: string;
  rating: number;
  image: string;
  reviewDate: string;
  isDisplay: boolean;
  isRead: boolean;
}

interface EditReviewFormProps {
  review: Review;
}

export default function EditReviewForm({ review }: EditReviewFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(updateReviewWithState, {
    error: null,
    message: '',
    success: false,
    reviewId: review.id,
  });

  const [rating, setRating] = useState(review.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(review.image);
  const [dragActive, setDragActive] = useState(false);
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Form field states
  const [formData, setFormData] = useState({
    name: review.name,
    review: review.review,
    reviewDate: review.reviewDate,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Update hidden input when compressed image file changes
  useEffect(() => {
    if (compressedImageFile && hiddenImageInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressedImageFile);
      hiddenImageInputRef.current.files = dataTransfer.files;
    }
  }, [compressedImageFile]);

  // Handle success state
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setTimeout(() => {
        router.push('/admin/review/review-list');
        router.refresh();
      }, 1500);
    }
  }, [state.success, state.message, router]);

  // Handle error state
  useEffect(() => {
    if (state.message && !state.success && state.message.trim()) {
      toast.error(state.message);
    }
  }, [state.message, state.success]);

  // Client-side image compression
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.85;

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Compression failed'));
                  return;
                }

                const sizeInMB = blob.size / (1024 * 1024);

                if (sizeInMB < 1 || quality <= 0.3) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  quality -= 0.1;
                  tryCompress();
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        };

        img.onerror = () => reject(new Error('Failed to load image'));
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const processFile = async (file: File | undefined) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Image must be less than 100MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Image must be JPEG, PNG, or WebP format');
      return;
    }

    const originalSizeInMB = file.size / (1024 * 1024);
    const loadingToastId = toast.loading(`Compressing image (${originalSizeInMB.toFixed(2)}MB)...`);

    try {
      const compressed = await compressImage(file);
      const compressedSizeInMB = compressed.size / (1024 * 1024);

      toast.dismiss(loadingToastId);
      toast.success(`Image compressed: ${originalSizeInMB.toFixed(2)}MB → ${compressedSizeInMB.toFixed(2)}MB`, {
        duration: 3000,
      });

      setCompressedImageFile(compressed);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to compress image. Please try another image.');
      console.error('Compression error:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('/images/avatar.webp');
    setCompressedImageFile(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (hiddenImageInputRef.current) {
      hiddenImageInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="rounded bg-foreground shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Edit Review
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update customer review details</p>
        </div>
        <Link href="/admin/review/review-list">
          <Button variant="outline" className="cursor-pointer rounded">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      {/* Success Message */}
      {state.success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Review updated successfully! Redirecting...
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-6">
        {/* Hidden inputs */}
        <input type="hidden" name="reviewId" value={review.id} />
        <input type="hidden" name="rating" value={rating} />
        <input type="hidden" name="removeImage" value={removeImage.toString()} />

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-2">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
            placeholder="Enter customer name"
            required
          />
        </div>

        {/* Review */}
        <div>
          <label htmlFor="review" className="block text-sm font-semibold mb-2">
            Review Message <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">(minimum 10 characters)</span>
          </label>
          <textarea
            id="review"
            name="review"
            value={formData.review}
            onChange={handleInputChange}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition min-h-[120px] disabled:opacity-50 resize-none"
            placeholder="Edit review message..."
            required
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.review.length} / 10 characters minimum</p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isPending}
                className="transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 self-center">{rating} / 5</span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">Profile Image</label>

          {imagePreview && imagePreview !== '/images/avatar.webp' ? (
            <div className="relative mb-4 group">
              <Image
                src={imagePreview}
                alt="Preview"
                width={150}
                height={150}
                className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 w-32 h-32 mx-auto"
                unoptimized
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center w-32 h-32 mx-auto">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    disabled={isPending}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                    title="Replace Image"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isPending}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                    title="Remove Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={!isPending ? handleImageClick : undefined}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded p-8 text-center transition-all duration-200 ${
                isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                dragActive
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-purple-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <FileImage className={`h-12 w-12 mb-4 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
                <p className="text-base text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">JPEG, PNG, or WebP (max 100MB)</p>
                <p className="text-xs text-gray-400 mt-1">Images will be automatically compressed</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleImageChange}
            disabled={isPending}
            className="hidden"
          />

          <input
            ref={hiddenImageInputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            disabled={isPending}
            className="hidden"
          />
        </div>

        {/* Review Date */}
        <div>
          <label htmlFor="reviewDate" className="block text-sm font-semibold mb-2">
            Review Date
          </label>
          <input
            type="date"
            id="reviewDate"
            name="reviewDate"
            value={formData.reviewDate}
            onChange={handleInputChange}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg cursor-pointer"
          >
            {isPending ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Update Review
              </>
            )}
          </Button>

          <Link href="/admin/review/review-list" className="flex-none">
            <Button type="button" variant="outline" disabled={isPending} className="cursor-pointer rounded h-full px-6">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
