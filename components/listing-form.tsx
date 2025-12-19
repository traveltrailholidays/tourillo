'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { createListing, updateListing } from '@/lib/actions/listing-actions';
import { categories } from '@/data/categories';
import {
  Upload,
  Trash2,
  Minus,
  Image as ImageIcon,
  Save,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ListingFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    imageSrc?: string;
    category?: string;
    location?: string;
    price?: number;
    days?: number;
    nights?: number;
    rating?: number;
    discount?: number;
    itinary?: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
}

const ListingForm: React.FC<ListingFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageSrc || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(!!initialData?.imageSrc);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Bulk Upload States
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      location: initialData?.location || '',
      price: initialData?.price || 1,
      days: initialData?.days || 1,
      nights: initialData?.nights || 0,
      rating: initialData?.rating || 5,
      discount: initialData?.discount || 0,
      itinary: initialData?.itinary || [''],
    },
  });

  const watchedFields = watch();

  useEffect(() => {
    if (initialData?.imageSrc && !compressedImageFile) {
      setImagePreview(initialData.imageSrc);
      setHasExistingImage(true);
    }
  }, [initialData?.imageSrc, compressedImageFile]);

  useEffect(() => {
    if (initialData?.category) {
      setValue('category', initialData.category);
    }
  }, [initialData?.category, setValue]);

  const getItineraryError = (index: number): string | undefined => {
    if (errors.itinary && Array.isArray(errors.itinary)) {
      const error = errors.itinary[index];
      if (error && typeof error === 'object' && 'message' in error) {
        return error.message as string;
      }
    }
    return undefined;
  };

  // Download Excel Template
  const downloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');

      const templateData = [
        {
          'Package Title': 'Sample Package',
          Description: 'This is a sample package description',
          Category: 'adventure',
          Location: 'Manali | Himachal Pradesh | sample',
          'Price (₹)': 15000,
          Days: 3,
          Nights: 2,
          'Rating (out of 5)': 4.5,
          'Discount (%)': 10,
          'Image URL': 'https://example.com/image.jpg',
          'Day 1': 'Arrival and check-in at hotel',
          'Day 2': 'Sightseeing and adventure activities',
          'Day 3': 'Departure',
          'Created By (Name)': 'John Doe',
          'Created By (Role)': 'Agent',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      // Set column widths
      const columnWidths = [
        { wch: 35 }, // Package Title
        { wch: 50 }, // Description
        { wch: 15 }, // Category
        { wch: 25 }, // Location
        { wch: 12 }, // Price
        { wch: 8 }, // Days
        { wch: 8 }, // Nights
        { wch: 15 }, // Rating
        { wch: 12 }, // Discount
        { wch: 40 }, // Image URL
        { wch: 50 }, // Day 1
        { wch: 50 }, // Day 2
        { wch: 50 }, // Day 3
        { wch: 20 }, // Created By Name
        { wch: 15 }, // Created By Role
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.writeFile(workbook, 'package_upload_template.xlsx');
      toast.success('Template downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Template download error:', error);
    }
  };

  // Handle Bulk Upload
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setShowBulkDialog(true);
    setIsBulkUploading(true);
    setBulkProgress(0);
    setBulkResult(null);

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('Excel file is empty');
        setIsBulkUploading(false);
        return;
      }

      const results: BulkUploadResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      // ✅ Helper function to safely parse numbers
      const parseNumber = (value: any, defaultValue: number = 0): number => {
        if (value === null || value === undefined || value === '') return defaultValue;
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
      };

      // Process each row
      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        setBulkProgress(Math.round(((i + 1) / jsonData.length) * 100));

        try {
          // ✅ Extract itinerary days dynamically
          const itinary: string[] = [];
          let dayIndex = 1;
          while (row[`Day ${dayIndex}`]) {
            const dayContent = String(row[`Day ${dayIndex}`]).trim();
            if (dayContent) {
              itinary.push(dayContent);
            }
            dayIndex++;
          }

          if (itinary.length === 0) {
            throw new Error('No itinerary days found');
          }

          // ✅ Prepare package data with robust parsing
          const packageData = {
            title: String(row['Package Title'] || '').trim(),
            description: String(row['Description'] || '').trim(),
            category: String(row['Category'] || '')
              .toLowerCase()
              .trim(),
            location: String(row['Location'] || '').trim(),
            price: parseNumber(row['Price (₹)'], 1),
            days: parseNumber(row['Days'], itinary.length),
            nights: parseNumber(row['Nights'], Math.max(0, itinary.length - 1)),
            rating: parseNumber(row['Rating (out of 5)'], 4.5),
            discount: parseNumber(row['Discount (%)'], 0),
            imageSrc: String(row['Image URL'] || '').trim(),
            itinary: itinary,
            creatorName: row['Created By (Name)'] ? String(row['Created By (Name)']).trim() : null,
            creatorRole: row['Created By (Role)'] ? String(row['Created By (Role)']).trim() : null,
          };

          // ✅ Validate required fields
          if (!packageData.title) {
            throw new Error('Package title is required');
          }
          if (!packageData.description) {
            throw new Error('Description is required');
          }
          if (!packageData.category) {
            throw new Error('Category is required');
          }
          if (!packageData.location) {
            throw new Error('Location is required');
          }
          if (packageData.price < 1) {
            throw new Error('Price must be at least ₹1');
          }
          if (packageData.days < 1) {
            throw new Error('Days must be at least 1');
          }

          console.log('📦 Processing package:', {
            title: packageData.title,
            price: packageData.price,
            days: packageData.days,
            nights: packageData.nights,
            rating: packageData.rating,
            itineraryDays: packageData.itinary.length,
          });

          // Create FormData
          const formData = new FormData();
          formData.append('title', packageData.title);
          formData.append('description', packageData.description);
          formData.append('category', packageData.category);
          formData.append('location', packageData.location);
          formData.append('price', packageData.price.toString());
          formData.append('days', packageData.days.toString());
          formData.append('nights', packageData.nights.toString());
          formData.append('rating', packageData.rating.toString());
          formData.append('discount', packageData.discount.toString());
          formData.append('itinary', JSON.stringify(packageData.itinary));
          formData.append('imageSrc', packageData.imageSrc);

          // Add creator info for backend to match
          if (packageData.creatorName && packageData.creatorRole) {
            formData.append('creatorName', packageData.creatorName);
            formData.append('creatorRole', packageData.creatorRole);
          }

          // Create listing
          await createListing(formData);
          results.success++;
          console.log('✅ Package created:', packageData.title);
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Failed to create';
          console.error('❌ Failed to create package:', errorMsg, row);
          results.errors.push(`Row ${i + 1} (${row['Package Title'] || 'Unknown'}): ${errorMsg}`);
        }
      }

      setBulkResult(results);

      if (results.success > 0) {
        toast.success(`${results.success} packages created successfully!`);
        router.refresh();
      }

      if (results.failed > 0) {
        toast.error(`${results.failed} packages failed to create`);
      }
    } catch (error) {
      toast.error('Failed to process Excel file');
      console.error('Bulk upload error:', error);
    } finally {
      setIsBulkUploading(false);
      if (excelInputRef.current) {
        excelInputRef.current.value = '';
      }
    }
  };

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
          const maxWidth = 1920;
          const maxHeight = 1080;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
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

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('price', data.price.toString());
      formData.append('days', data.days.toString());
      formData.append('nights', data.nights.toString());
      formData.append('rating', data.rating.toString());
      formData.append('discount', data.discount.toString());
      formData.append('itinary', JSON.stringify(data.itinary));

      if (compressedImageFile) {
        formData.append('image', compressedImageFile);
      }

      if (removeImage) {
        formData.append('removeImage', 'true');
      }

      if (initialData?.id) {
        await updateListing(initialData.id, formData);
        toast.success('Package updated successfully!');
        router.push('/admin/package/package-list');
      } else {
        await createListing(formData);
        toast.success('Package created successfully!');
        reset();
        setImagePreview(null);
        setRemoveImage(false);
        setCompressedImageFile(null);
        setHasExistingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
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
      setHasExistingImage(false);

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
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setRemoveImage(true);
    setCompressedImageFile(null);
    setHasExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numDays = parseInt(e.target.value) || 1;
    const numNights = Math.max(0, numDays - 1);

    setValue('days', numDays);
    setValue('nights', numNights);

    const currentItinary = watchedFields.itinary;
    const newItinary = Array(numDays)
      .fill('')
      .map((_, index) => currentItinary[index] || '');
    setValue('itinary', newItinary);
  };

  const removeItineraryDay = (index: number) => {
    const currentItinary = watchedFields.itinary || [];
    const newItinary = currentItinary.filter((_: string, i: number) => i !== index);
    setValue('itinary', newItinary);

    setValue('days', newItinary.length);
    setValue('nights', Math.max(0, newItinary.length - 1));
  };

  const isCategorySelected = (categoryLabel: string): boolean => {
    return watchedFields.category?.toLowerCase() === categoryLabel.toLowerCase();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {initialData?.id ? 'Edit Package' : 'Create New Package'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {initialData?.id ? 'Make your package even better' : 'Easily create and manage packages with confidence'}
            </p>
          </div>

          {/* Bulk Upload Button - Only show for new packages */}
          {!initialData?.id && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={downloadTemplate}
                variant="outline"
                className="flex items-center gap-2 cursor-pointer rounded"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <Button
                type="button"
                onClick={() => excelInputRef.current?.click()}
                className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer rounded"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Bulk Upload
              </Button>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleBulkUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-foreground rounded shadow-lg p-4 sm:p-8">
        {onCancel && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Category Selection */}
          <div>
            <label className="block text-base sm:text-lg font-medium mb-4">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setValue('category', item.label.toLowerCase())}
                  className={`p-3 sm:p-4 border-2 rounded-sm transition-all duration-200 cursor-pointer hover:bg-border ${
                    isCategorySelected(item.label)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-center">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.category && <p className="mt-1 text-sm text-red-600">Category is required</p>}
          </div>

          {/* Basic Information */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="Package title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                {...register('location', { required: 'Location is required' })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="Destination location"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
              placeholder="Package description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>}
          </div>

          {/* Image Upload */}
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
                  className="rounded-sm object-cover border-2 border-gray-200 dark:border-gray-700 w-full max-w-md h-48 sm:h-64"
                  unoptimized={!hasExistingImage}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm flex items-center justify-center max-w-md">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Replace Image"
                    >
                      <Upload className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
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
                onClick={!isLoading ? () => fileInputRef.current?.click() : undefined}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-sm p-6 sm:p-8 text-center transition-all duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                }`}
              >
                <div className="flex flex-col items-center">
                  <ImageIcon
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageChange}
              disabled={isLoading}
              className="hidden"
            />
          </div>

          {/* Pricing and Details */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Price (₹) *</label>
              <input
                type="number"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 1, message: 'Price must be at least ₹1' },
                })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="0"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days *</label>
              <input
                type="number"
                {...register('days', {
                  required: 'Days is required',
                  min: { value: 1, message: 'Must be at least 1 day' },
                })}
                onChange={handleDaysChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="1"
              />
              {errors.days && <p className="mt-1 text-sm text-red-600">{errors.days.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nights</label>
              <input
                type="number"
                {...register('nights')}
                value={watchedFields.nights}
                readOnly
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('rating', {
                  min: { value: 0, message: 'Rating cannot be negative' },
                  max: { value: 5, message: 'Rating cannot exceed 5' },
                })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="5.0"
              />
              {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message as string}</p>}
            </div>
          </div>

          <div className="w-full sm:w-1/2 lg:w-1/4">
            <label className="block text-sm font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              {...register('discount', {
                min: { value: 0, message: 'Discount cannot be negative' },
                max: { value: 100, message: 'Discount cannot exceed 100%' },
              })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
              placeholder="0"
            />
            {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount.message as string}</p>}
          </div>

          {/* Itinerary */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-base sm:text-lg font-medium">Itinerary *</label>
            </div>

            <div className="space-y-4">
              {(watchedFields.itinary || ['']).map((item: string, index: number) => (
                <div key={index} className="flex gap-2 sm:gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Day {index + 1}</label>
                    <textarea
                      {...register(`itinary.${index}`, {
                        required: `Day ${index + 1} description is required`,
                      })}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                      placeholder={`Activities for day ${index + 1}`}
                    />
                    {getItineraryError(index) && (
                      <p className="mt-1 text-sm text-red-600">{getItineraryError(index)}</p>
                    )}
                  </div>

                  {watchedFields.itinary?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(index)}
                      className="self-start mt-8 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                variant="outline"
                className="px-6 sm:px-8 py-3 cursor-pointer"
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-6 sm:px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading
                ? initialData?.id
                  ? 'Updating...'
                  : 'Creating...'
                : initialData?.id
                  ? 'Update Package'
                  : 'Create Package'}
            </Button>
          </div>
        </form>
      </div>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Bulk Upload Progress
            </DialogTitle>
            <DialogDescription>{isBulkUploading ? 'Processing packages...' : 'Upload completed'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isBulkUploading ? (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-linear-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm font-semibold">{bulkProgress}% Complete</p>
              </div>
            ) : bulkResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-foreground border border-green-200">
                  <span className="text-sm font-medium">✓ Successful</span>
                  <span className="text-lg font-bold text-green-600">{bulkResult.success}</span>
                </div>

                {bulkResult.failed > 0 && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-foreground rounded border border-red-200">
                      <span className="text-sm font-medium">✗ Failed</span>
                      <span className="text-lg font-bold text-red-600">{bulkResult.failed}</span>
                    </div>

                    {bulkResult.errors.length > 0 && (
                      <div className="max-h-40 overflow-y-auto p-3 bg-foreground rounded border border-gray-200">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Error Details:
                        </p>
                        <ul className="text-xs space-y-1">
                          {bulkResult.errors.map((error, idx) => (
                            <li key={idx} className="text-red-600">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>

          {!isBulkUploading && (
            <DialogFooter>
              <Button
                onClick={() => {
                  setShowBulkDialog(false);
                  setBulkResult(null);
                  setBulkProgress(0);
                }}
                className="flex items-center justify-center px-6 sm:px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingForm;
