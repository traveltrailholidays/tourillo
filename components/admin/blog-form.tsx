'use client';

import { createBlogWithState, updateBlogWithState } from '@/lib/actions/blog-actions';
import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Image as ImageIcon, Upload, Trash2, FileImage, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import CreatableSelect from 'react-select/creatable';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/rich-text-editor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});

interface BlogFormProps {
  initialData?: {
    id?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    category?: string;
    author?: string;
    readTime?: string;
    featured?: boolean;
    published?: boolean;
  };
  onCancel?: () => void;
}

// Default category options
const defaultCategoryOptions = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Design', label: 'Design' },
  { value: 'Development', label: 'Development' },
  { value: 'Business', label: 'Business' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Lifestyle', label: 'Lifestyle' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Food', label: 'Food' },
];

const BlogForm: React.FC<BlogFormProps> = ({ initialData, onCancel }) => {
  const router = useRouter();
  const isEditMode = !!initialData?.id;

  // For create operations with useActionState
  const [createState, createFormAction, isCreating] = useActionState(createBlogWithState, {
    error: null,
    message: '',
    success: false,
  });

  // For update operations with useActionState
  const [updateState, updateFormAction, isUpdating] = useActionState(updateBlogWithState, {
    error: null,
    message: '',
    success: false,
    blogId: initialData?.id || '',
  });

  // Use appropriate state based on mode
  const state = isEditMode ? updateState : createState;
  const formAction = isEditMode ? updateFormAction : createFormAction;
  const isPending = isEditMode ? isUpdating : isCreating;

  // Image handling states
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [hasExistingImage, setHasExistingImage] = useState(!!initialData?.image);
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);

  // Content and category states
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedCategory, setSelectedCategory] = useState<{ value: string; label: string } | null>(
    initialData?.category ? { value: initialData.category, label: initialData.category } : null
  );

  // Set initial image preview from existing data
  useEffect(() => {
    if (initialData?.image && !compressedImageFile) {
      setImagePreview(initialData.image);
      setHasExistingImage(true);
    }
  }, [initialData?.image, compressedImageFile]);

  // Handle success state
  useEffect(() => {
    if (state.success) {
      if (isEditMode) {
        toast.success('Blog post updated successfully!');
      } else {
        toast.success('Blog post created successfully!');
      }

      setTimeout(() => {
        router.push('/admin/blog/blog-list');
        router.refresh();
      }, 1000);
    }
  }, [state.success, isEditMode, router]);

  // Handle error state
  useEffect(() => {
    if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.message, state.success]);

  // Update hidden input when compressed image file changes
  useEffect(() => {
    if (compressedImageFile && hiddenImageInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressedImageFile);
      hiddenImageInputRef.current.files = dataTransfer.files;
    }
  }, [compressedImageFile]);

  // Client-side image compression function
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

          // Calculate new dimensions (max 1920x1080)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Start with high quality
          let quality = 0.85;

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Compression failed'));
                  return;
                }

                const sizeInMB = blob.size / (1024 * 1024);

                // If under 1MB, we're done
                if (sizeInMB < 1 || quality <= 0.3) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });

                  console.log(
                    `Original: ${(file.size / (1024 * 1024)).toFixed(2)}MB → Compressed: ${sizeInMB.toFixed(2)}MB`
                  );
                  resolve(compressedFile);
                } else {
                  // Reduce quality and try again
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

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  // Process file function with compression
  const processFile = async (file: File | undefined) => {
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Image must be less than 100MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Image must be JPEG, PNG, or WebP format');
      return;
    }

    const originalSizeInMB = file.size / (1024 * 1024);

    // Show loading toast for compression
    const loadingToastId = toast.loading(`Compressing image (${originalSizeInMB.toFixed(2)}MB)...`);

    try {
      // Compress image on client-side
      const compressed = await compressImage(file);
      const compressedSizeInMB = compressed.size / (1024 * 1024);

      toast.dismiss(loadingToastId);
      toast.success(`Image compressed: ${originalSizeInMB.toFixed(2)}MB → ${compressedSizeInMB.toFixed(2)}MB`, {
        duration: 3000,
      });

      // Store compressed file
      setCompressedImageFile(compressed);
      setHasExistingImage(false);

      // Create preview from compressed image
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setRemoveImage(false);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to compress image. Please try another image.');
      console.error('Compression error:', error);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRemoveImage(true);
    setHasExistingImage(false);
    setCompressedImageFile(null);
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

  // Helper function to get field error
  const getFieldError = (fieldName: string): string | undefined => {
    if (state.error && typeof state.error === 'object' && fieldName in state.error) {
      const errorRecord = state.error as Record<string, { _errors?: string[] }>;
      return errorRecord[fieldName]?._errors?.[0];
    }
    return undefined;
  };

  return (
    <div className="mx-auto p-3 sm:p-6">
      <div className="bg-foreground rounded-lg shadow-lg p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Success Message */}
        {state.success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {isEditMode ? 'Blog post updated successfully!' : 'Blog post created successfully!'}
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-6">
          {/* Hidden field for blog ID in edit mode */}
          {isEditMode && <input type="hidden" name="blogId" value={initialData.id} />}

          {/* Hidden inputs for content and category */}
          <input type="hidden" name="content" value={content} />
          <input type="hidden" name="category" value={selectedCategory?.value || ''} />

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={initialData?.title}
                required
                disabled={isPending}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
                  getFieldError('title') ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Enter blog title..."
              />
              {getFieldError('title') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('title')}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="sm:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                defaultValue={initialData?.excerpt}
                required
                disabled={isPending}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background resize-none disabled:opacity-50 ${
                  getFieldError('excerpt')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Brief description of the blog post..."
              />
              {getFieldError('excerpt') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('excerpt')}</p>
              )}
            </div>

            {/* Category - Creatable Select */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category *
              </label>
              <CreatableSelect
                id="category"
                options={defaultCategoryOptions}
                value={selectedCategory}
                onChange={(newValue) => setSelectedCategory(newValue)}
                isDisabled={isPending}
                isClearable
                placeholder="Select or create category..."
                className="text-sm sm:text-base"
                classNamePrefix="select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: '44px',
                    backgroundColor: 'var(--background)',
                    borderColor: getFieldError('category')
                      ? '#ef4444'
                      : state.isFocused
                        ? '#a855f7'
                        : 'rgb(209 213 219)',
                    '&:hover': {
                      borderColor: state.isFocused ? '#a855f7' : 'rgb(156 163 175)',
                    },
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(168, 85, 247, 0.2)' : 'none',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'var(--background)',
                    zIndex: 50,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#a855f7'
                      : state.isFocused
                        ? 'rgb(243 232 255)'
                        : 'var(--background)',
                    color: state.isSelected ? 'white' : 'var(--foreground)',
                    '&:active': {
                      backgroundColor: '#a855f7',
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'var(--foreground)',
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'var(--foreground)',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: 'rgb(156 163 175)',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'rgb(243 232 255)',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'rgb(107 33 168)',
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: 'rgb(107 33 168)',
                    '&:hover': {
                      backgroundColor: 'rgb(233 213 255)',
                      color: 'rgb(107 33 168)',
                    },
                  }),
                }}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#a855f7',
                    primary25: 'rgb(243 232 255)',
                    primary50: 'rgb(233 213 255)',
                    primary75: 'rgb(216 180 254)',
                    danger: '#ef4444',
                    dangerLight: 'rgb(254 226 226)',
                    neutral0: 'var(--background)',
                    neutral5: 'rgb(249 250 251)',
                    neutral10: 'rgb(243 244 246)',
                    neutral20: 'rgb(229 231 235)',
                    neutral30: 'rgb(209 213 219)',
                    neutral40: 'rgb(156 163 175)',
                    neutral50: 'rgb(107 114 128)',
                    neutral60: 'rgb(75 85 99)',
                    neutral70: 'rgb(55 65 81)',
                    neutral80: 'var(--foreground)',
                    neutral90: 'var(--foreground)',
                  },
                })}
              />
              {getFieldError('category') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('category')}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                defaultValue={initialData?.author}
                required
                disabled={isPending}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
                  getFieldError('author')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Author name..."
              />
              {getFieldError('author') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('author')}</p>
              )}
            </div>

            {/* Read Time */}
            <div className="sm:col-span-2">
              <label htmlFor="readTime" className="block text-sm font-medium mb-2">
                Read Time *
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                defaultValue={initialData?.readTime}
                required
                disabled={isPending}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
                  getFieldError('readTime')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="e.g., 5 min read"
              />
              {getFieldError('readTime') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('readTime')}</p>
              )}
            </div>
          </div>

          {/* Image Upload with Drag & Drop and Compression */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Featured Image
            </label>

            {imagePreview && !removeImage ? (
              <div className="relative mb-4 group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={250}
                  className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 w-full max-w-md h-48 sm:h-64"
                  unoptimized={!hasExistingImage}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center max-w-md">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleImageClick}
                      disabled={isPending}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Replace Image"
                    >
                      <Upload className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isPending}
                      className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                      title="Remove Image"
                    >
                      <Trash2 className="h-5 w-5" />
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
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-200 ${
                  isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-purple-500'
                }`}
              >
                <div className="flex flex-col items-center">
                  <FileImage
                    className={`h-10 w-10 sm:h-12 sm:w-12 mb-4 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`}
                  />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">JPEG, PNG, or WebP (max 100MB)</p>
                  <p className="text-xs text-gray-400 mt-1">Images will be automatically compressed</p>
                </div>
              </div>
            )}

            {/* Visible input for click */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageChange}
              disabled={isPending}
              className="hidden"
            />

            {/* Hidden input for form submission */}
            <input
              ref={hiddenImageInputRef}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              disabled={isPending}
              className="hidden"
            />

            {removeImage && <input type="hidden" name="removeImage" value="true" />}
          </div>

          {/* Rich Text Editor for Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            <RichTextEditor content={content} onChange={setContent} disabled={isPending} />
            {getFieldError('content') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('content')}</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initialData?.featured}
                disabled={isPending}
                className="rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
              />
              <span className="text-sm font-medium">Featured Post</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                defaultChecked={initialData?.published}
                disabled={isPending}
                className="rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
              />
              <span className="text-sm font-medium">Publish Immediately</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center px-6 py-3 bg-linear-to-r from-indigo-500 hover:from-indigo-600 via-purple-500 hover:via-purple-600 to-pink-500 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Post' : 'Create Post'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
