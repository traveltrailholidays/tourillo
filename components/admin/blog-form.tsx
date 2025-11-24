'use client';

import { createBlogWithState, updateBlogWithState } from '@/lib/actions/blog-actions';
import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Image as ImageIcon, Upload, Trash2, FileImage, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  // Process file function
  const processFile = (file: File | undefined) => {
    if (!file) return;

    if (file.size > 10000000) {
      toast.error('Image must be less than 10MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Image must be JPEG, PNG, or WebP format');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setRemoveImage(false);
    };
    reader.readAsDataURL(file);
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

      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="mx-auto p-6">
      <div className="bg-foreground rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xs transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Success Message */}
        {state.success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xs text-green-700 dark:text-green-400 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {isEditMode ? 'Blog post updated successfully!' : 'Blog post created successfully!'}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Hidden field for blog ID in edit mode */}
          {isEditMode && <input type="hidden" name="blogId" value={initialData.id} />}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
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
                className={`w-full px-4 py-3 border rounded-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
                  getFieldError('title') ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Enter blog title..."
              />
              {getFieldError('title') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('title')}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="md:col-span-2">
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
                className={`w-full px-4 py-3 border rounded-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background resize-none disabled:opacity-50 ${
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

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                defaultValue={initialData?.category}
                required
                disabled={isPending}
                className={`w-full px-4 py-3 border rounded-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
                  getFieldError('category')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <option value="">Select category...</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
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
                className={`w-full px-4 py-3 border rounded-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
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
            <div>
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
                className={`w-full px-4 py-3 border rounded-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background disabled:opacity-50 ${
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

          {/* Image Upload with Drag & Drop */}
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
                  className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 w-full max-w-md h-64"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
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
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-purple-500'
                }`}
              >
                <div className="flex flex-col items-center">
                  <FileImage className={`h-12 w-12 mb-4 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
                  <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">JPEG, PNG, or WebP (max 10MB)</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageChange}
              disabled={isPending}
              className="hidden"
            />
            {removeImage && <input type="hidden" name="removeImage" value="true" />}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              rows={15}
              defaultValue={initialData?.content}
              required
              disabled={isPending}
              className={`w-full px-4 py-3 border rounded-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background resize-y disabled:opacity-50 ${
                getFieldError('content') ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              placeholder="Write your blog content here..."
            />
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
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center px-6 py-3 bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 text-white font-medium rounded-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Post' : 'Create Post'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
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
