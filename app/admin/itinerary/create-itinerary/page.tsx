'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { createItinerary, generateNewTravelId } from '@/lib/actions/itinerary-actions';
import { Upload, Trash2, Image as ImageIcon, Plus, Minus, Copy, Clipboard, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS, ROOM_TYPES, CAB_OPTIONS } from '@/data/itinerary';

// Image compression function
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

                console.log(
                  `Original: ${(file.size / (1024 * 1024)).toFixed(2)}MB → Compressed: ${sizeInMB.toFixed(2)}MB`
                );
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

// Updated Zod schema with new fields
const ItinerarySchema = z.object({
  travelId: z.string().min(1, 'Travel ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  packageTitle: z.string().min(1, 'Package title is required'),
  numberOfDays: z.number().min(1, 'Number of days must be at least 1'),
  numberOfNights: z.number(),
  numberOfHotels: z.number().min(1, 'Number of hotels must be at least 1'),
  tripAdvisorName: z.string().min(1, 'Trip advisor name is required'),
  tripAdvisorNumber: z.string().min(1, 'Trip advisor number is required'),
  cabs: z.string().min(1, 'Cabs details are required'),
  cabsCustom: z.string().optional(),
  flights: z.string().min(1, 'Flight details are required'),
  quotePrice: z.number().min(0, 'Quote price cannot be negative'),
  pricePerPerson: z.number().min(0, 'Price per person cannot be negative'),
  days: z.array(
    z.object({
      dayNumber: z.number(),
      summary: z.string().min(1, 'Day summary is required'),
      imageSrc: z.string().min(1, 'Image is required'),
      description: z.string().min(1, 'Day description is required'),
    })
  ),
  hotels: z.array(
    z.object({
      placeName: z.string().min(1, 'Place name is required'),
      placeDescription: z.string().min(1, 'Place description is required'),
      hotelName: z.string().min(1, 'Hotel name is required'),
      roomType: z.string().min(1, 'Room type is required'),
      roomTypeCustom: z.string().optional(),
      hotelDescription: z.string().min(1, 'Hotel description is required'),
    })
  ),
  inclusions: z.array(z.string().min(1)),
  exclusions: z.array(z.string().min(1)),
});

type ItineraryFormValues = z.infer<typeof ItinerarySchema>;

export default function CreateItinerary() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [dayImagePreviews, setDayImagePreviews] = useState<{ [key: number]: string }>({});
  const [dayDragActive, setDayDragActive] = useState<{ [key: number]: boolean }>({});
  const [compressedImages, setCompressedImages] = useState<{ [key: number]: File }>({});
  const dayFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [bulkInclusionText, setBulkInclusionText] = useState('');
  const [bulkExclusionText, setBulkExclusionText] = useState('');
  const [showCabsCustom, setShowCabsCustom] = useState(false);
  const [hotelRoomTypeCustom, setHotelRoomTypeCustom] = useState<{ [key: number]: boolean }>({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItineraryFormValues>({
    resolver: zodResolver(ItinerarySchema),
    defaultValues: {
      travelId: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      packageTitle: '',
      numberOfDays: 1,
      numberOfNights: 0,
      numberOfHotels: 1,
      tripAdvisorName: '',
      tripAdvisorNumber: '',
      cabs: '',
      cabsCustom: '',
      flights: '',
      quotePrice: 0,
      pricePerPerson: 0,
      days: Array.from({ length: 1 }, (_, index) => ({
        dayNumber: index + 1,
        summary: '',
        imageSrc: '',
        description: '',
      })),
      hotels: Array.from({ length: 1 }, () => ({
        placeName: '',
        placeDescription: '',
        hotelName: '',
        roomType: '',
        roomTypeCustom: '',
        hotelDescription: '',
      })),
      inclusions: [...DEFAULT_INCLUSIONS],
      exclusions: [...DEFAULT_EXCLUSIONS],
    },
  });

  const { fields: hotelFields, replace: replaceHotels } = useFieldArray({
    control,
    name: 'hotels',
  });

  const { fields: dayFields, replace: replaceDays } = useFieldArray({
    control,
    name: 'days',
  });

  const [inclusions, setInclusions] = useState<string[]>(DEFAULT_INCLUSIONS);
  const [exclusions, setExclusions] = useState<string[]>(DEFAULT_EXCLUSIONS);

  const numberOfDays = watch('numberOfDays');
  const numberOfHotels = watch('numberOfHotels');
  const cabsSelection = watch('cabs');

  // Initialize with auto-generated travel ID
  useEffect(() => {
    const initTravelId = async () => {
      const newId = await generateNewTravelId();
      setValue('travelId', newId);
    };
    initTravelId();
  }, [setValue]);

  // Watch for custom cab selection
  useEffect(() => {
    if (cabsSelection === 'Custom (Enter below)') {
      setShowCabsCustom(true);
    } else {
      setShowCabsCustom(false);
      setValue('cabsCustom', '');
    }
  }, [cabsSelection, setValue]);

  // Watch hotel room types for custom selection
  useEffect(() => {
    hotelFields.forEach((_, index) => {
      const roomType = watch(`hotels.${index}.roomType`);
      if (roomType === 'Custom (Enter below)') {
        setHotelRoomTypeCustom((prev) => ({ ...prev, [index]: true }));
      } else {
        setHotelRoomTypeCustom((prev) => ({ ...prev, [index]: false }));
        setValue(`hotels.${index}.roomTypeCustom`, '');
      }
    });
  }, [watch, hotelFields, setValue]);

  // Sync inclusions and exclusions with form
  useEffect(() => {
    setValue('inclusions', inclusions);
  }, [inclusions, setValue]);

  useEffect(() => {
    setValue('exclusions', exclusions);
  }, [exclusions, setValue]);

  // Update number of nights when days change
  useEffect(() => {
    setValue('numberOfNights', Math.max(0, numberOfDays - 1));
  }, [numberOfDays, setValue]);

  // Update days array when numberOfDays changes
  useEffect(() => {
    const currentDays = watch('days');
    if (Array.isArray(currentDays)) {
      const newDays = Array.from({ length: numberOfDays }, (_, index) => ({
        dayNumber: index + 1,
        summary: currentDays[index]?.summary || '',
        imageSrc: currentDays[index]?.imageSrc || '',
        description: currentDays[index]?.description || '',
      }));
      replaceDays(newDays);
    }
  }, [numberOfDays, replaceDays, watch]);

  // Update hotels array when numberOfHotels changes
  useEffect(() => {
    const currentHotels = watch('hotels');
    if (Array.isArray(currentHotels)) {
      const newHotels = Array.from({ length: numberOfHotels }, (_, index) => ({
        placeName: currentHotels[index]?.placeName || '',
        placeDescription: currentHotels[index]?.placeDescription || '',
        hotelName: currentHotels[index]?.hotelName || '',
        roomType: currentHotels[index]?.roomType || '',
        roomTypeCustom: currentHotels[index]?.roomTypeCustom || '',
        hotelDescription: currentHotels[index]?.hotelDescription || '',
      }));
      replaceHotels(newHotels);
    }
  }, [numberOfHotels, replaceHotels, watch]);

  // Generate new Travel ID
  const handleGenerateNewTravelId = async () => {
    setIsGeneratingId(true);
    try {
      const newId = await generateNewTravelId();
      setValue('travelId', newId);
      toast.success('New Travel ID generated!');
    } catch (error) {
      toast.error('Failed to generate Travel ID');
    } finally {
      setIsGeneratingId(false);
    }
  };

  // Handle bulk inclusions paste
  const handleBulkInclusionsPaste = () => {
    if (!bulkInclusionText.trim()) {
      toast.error('Please enter inclusions to add');
      return;
    }

    const lines = bulkInclusionText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      toast.error('No valid inclusions found');
      return;
    }

    setInclusions((prev) => [...prev, ...lines]);
    setBulkInclusionText('');
    toast.success(`Added ${lines.length} inclusion(s)`);
  };

  // Handle bulk exclusions paste
  const handleBulkExclusionsPaste = () => {
    if (!bulkExclusionText.trim()) {
      toast.error('Please enter exclusions to add');
      return;
    }

    const lines = bulkExclusionText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      toast.error('No valid exclusions found');
      return;
    }

    setExclusions((prev) => [...prev, ...lines]);
    setBulkExclusionText('');
    toast.success(`Added ${lines.length} exclusion(s)`);
  };

  // Add/Remove individual inclusions
  const addInclusion = () => {
    setInclusions((prev) => [...prev, '']);
  };

  const removeInclusion = (index: number) => {
    if (inclusions.length > 1) {
      setInclusions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateInclusion = (index: number, value: string) => {
    setInclusions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  // Add/Remove individual exclusions
  const addExclusion = () => {
    setExclusions((prev) => [...prev, '']);
  };

  const removeExclusion = (index: number) => {
    if (exclusions.length > 1) {
      setExclusions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateExclusion = (index: number, value: string) => {
    setExclusions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const processImageFile = async (file: File | undefined, dayIndex: number) => {
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

      setCompressedImages((prev) => ({ ...prev, [dayIndex]: compressed }));

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setDayImagePreviews((prev) => ({ ...prev, [dayIndex]: result }));
        setValue(`days.${dayIndex}.imageSrc`, result);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to compress image. Please try another image.');
      console.error('Compression error:', error);
    }
  };

  const handleDayImageChange = (e: React.ChangeEvent<HTMLInputElement>, dayIndex: number) => {
    const file = e.target.files?.[0];
    processImageFile(file, dayIndex);
  };

  const handleDayDrag = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDayDragActive((prev) => ({ ...prev, [dayIndex]: true }));
    } else if (e.type === 'dragleave') {
      setDayDragActive((prev) => ({ ...prev, [dayIndex]: false }));
    }
  };

  const handleDayDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDayDragActive((prev) => ({ ...prev, [dayIndex]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageFile(file, dayIndex);
    }
  };

  const handleRemoveDayImage = (dayIndex: number) => {
    setDayImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[dayIndex];
      return newPreviews;
    });
    setCompressedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[dayIndex];
      return newImages;
    });
    setValue(`days.${dayIndex}.imageSrc`, '');
    if (dayFileInputRefs.current[dayIndex]) {
      dayFileInputRefs.current[dayIndex]!.value = '';
    }
  };

  const onSubmit = async (data: ItineraryFormValues) => {
    setIsSubmitting(true);
    try {
      // Merge custom values if selected
      const finalData = {
        ...data,
        cabs: data.cabs === 'Custom (Enter below)' ? data.cabsCustom || data.cabs : data.cabs,
        hotels: data.hotels.map((hotel) => ({
          ...hotel,
          roomType: hotel.roomType === 'Custom (Enter below)' ? hotel.roomTypeCustom || hotel.roomType : hotel.roomType,
        })),
      };

      const result = await createItinerary(finalData);
      toast.success(`Itinerary created! Travel ID: ${result.travelId}`, { duration: 5000 });

      // Copy Travel ID to clipboard
      navigator.clipboard.writeText(result.travelId);
      toast.success('Travel ID copied to clipboard!');

      // Open in new tab
      window.open(`/itinerary/view/${result.travelId}`, '_blank');

      // Redirect to list
      setTimeout(() => {
        router.push('/admin/itinerary/itinerary-list');
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create itinerary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'w-full p-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-foreground';
  const labelClassName = 'block text-sm font-semibold mb-2';
  const errorClassName = 'text-red-500 text-sm mt-1';

  return (
    <div className="container mx-auto p-6">
      <div className="bg-foreground rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Itinerary
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Travel ID Section */}
          <div className="p-6 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
            <label className={labelClassName}>
              Travel ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register('travelId')}
                type="text"
                placeholder="TRL2411202516110001"
                className={`${inputClassName} font-mono text-lg font-bold`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleGenerateNewTravelId}
                disabled={isSubmitting || isGeneratingId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                title="Generate New Travel ID"
              >
                <RefreshCw className={`h-5 w-5 ${isGeneratingId ? 'animate-spin' : ''}`} />
                Generate
              </button>
            </div>
            {errors.travelId && <p className={errorClassName}>{errors.travelId.message}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Format: TRL + Date (DDMMYYYY) + Time (HHMM) + Random (0001-9999)
            </p>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('clientName')}
                type="text"
                placeholder="Enter client's name"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.clientName && <p className={errorClassName}>{errors.clientName.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Client Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('clientPhone')}
                type="tel"
                placeholder="Enter phone number"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.clientPhone && <p className={errorClassName}>{errors.clientPhone.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Client Email <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                {...register('clientEmail')}
                type="email"
                placeholder="Enter email address"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.clientEmail && <p className={errorClassName}>{errors.clientEmail.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Package Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('packageTitle')}
                type="text"
                placeholder="Enter package title"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.packageTitle && <p className={errorClassName}>{errors.packageTitle.message}</p>}
            </div>
          </div>

          {/* Numbers Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClassName}>
                Number of Days <span className="text-red-500">*</span>
              </label>
              <input
                {...register('numberOfDays', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="Enter number of days"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.numberOfDays && <p className={errorClassName}>{errors.numberOfDays.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>Number of Nights (Auto-calculated)</label>
              <input
                {...register('numberOfNights', { valueAsNumber: true })}
                type="number"
                disabled
                className={`${inputClassName} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={labelClassName}>
                Number of Hotels <span className="text-red-500">*</span>
              </label>
              <input
                {...register('numberOfHotels', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="Enter number of hotels"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.numberOfHotels && <p className={errorClassName}>{errors.numberOfHotels.message}</p>}
            </div>
          </div>

          {/* Trip Advisor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>
                Trip Advisor Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('tripAdvisorName')}
                type="text"
                placeholder="Enter Trip Advisor Name"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.tripAdvisorName && <p className={errorClassName}>{errors.tripAdvisorName.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Trip Advisor Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('tripAdvisorNumber')}
                type="text"
                placeholder="Enter Trip Advisor Number"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.tripAdvisorNumber && <p className={errorClassName}>{errors.tripAdvisorNumber.message}</p>}
            </div>
          </div>

          {/* Transport Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>
                Cabs Details <span className="text-red-500">*</span>
              </label>
              <select {...register('cabs')} className={inputClassName} disabled={isSubmitting}>
                <option value="">Select cab option</option>
                {CAB_OPTIONS.map((cab) => (
                  <option key={cab} value={cab}>
                    {cab}
                  </option>
                ))}
              </select>
              {errors.cabs && <p className={errorClassName}>{errors.cabs.message}</p>}

              {/* Custom Cab Input */}
              {showCabsCustom && (
                <div className="mt-3">
                  <input
                    {...register('cabsCustom')}
                    type="text"
                    placeholder="Enter custom cab details"
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={labelClassName}>
                Flights Details <span className="text-red-500">*</span>
              </label>
              <input
                {...register('flights')}
                type="text"
                placeholder="Enter flight details (e.g., Included/Not Included)"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.flights && <p className={errorClassName}>{errors.flights.message}</p>}
            </div>
          </div>

          {/* Price Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>
                Quote Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('quotePrice', { valueAsNumber: true })}
                type="number"
                placeholder="Enter total quote price"
                className={inputClassName}
                min={0}
                disabled={isSubmitting}
              />
              {errors.quotePrice && <p className={errorClassName}>{errors.quotePrice.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Price per Person (₹) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('pricePerPerson', { valueAsNumber: true })}
                type="number"
                placeholder="Enter price per person"
                className={inputClassName}
                min={0}
                disabled={isSubmitting}
              />
              {errors.pricePerPerson && <p className={errorClassName}>{errors.pricePerPerson.message}</p>}
            </div>
          </div>

          {/* Days Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Daily Itinerary</h3>
            {dayFields.map((field, index) => (
              <div
                key={field.id}
                className="mb-6 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Day {index + 1}</h4>
                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>
                      Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`days.${index}.summary`)}
                      placeholder={`Brief summary for Day ${index + 1}`}
                      rows={2}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.days?.[index]?.summary && (
                      <p className={errorClassName}>{errors.days[index]?.summary?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      <ImageIcon className="h-4 w-4 inline mr-1" />
                      Day Image <span className="text-red-500">*</span>
                    </label>

                    {dayImagePreviews[index] ? (
                      <div className="relative mb-4 group">
                        <Image
                          src={dayImagePreviews[index]}
                          alt={`Day ${index + 1}`}
                          width={400}
                          height={250}
                          className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 w-full max-w-md h-64"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center max-w-md">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => dayFileInputRefs.current[index]?.click()}
                              disabled={isSubmitting}
                              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              <Upload className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDayImage(index)}
                              disabled={isSubmitting}
                              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={!isSubmitting ? () => dayFileInputRefs.current[index]?.click() : undefined}
                        onDragEnter={(e) => handleDayDrag(e, index)}
                        onDragLeave={(e) => handleDayDrag(e, index)}
                        onDragOver={(e) => handleDayDrag(e, index)}
                        onDrop={(e) => handleDayDrop(e, index)}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          dayDragActive[index]
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <ImageIcon
                            className={`h-12 w-12 mb-4 ${dayDragActive[index] ? 'text-purple-500' : 'text-gray-400'}`}
                          />
                          <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                            {dayDragActive[index] ? 'Drop image here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-sm text-gray-500">JPEG, PNG, or WebP (max 100MB)</p>
                          <p className="text-xs text-gray-400 mt-1">Images will be automatically compressed</p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={(el) => {
                        dayFileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleDayImageChange(e, index)}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                    {errors.days?.[index]?.imageSrc && (
                      <p className={errorClassName}>{errors.days[index]?.imageSrc?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`days.${index}.description`)}
                      placeholder="Detailed description of activities"
                      rows={4}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.days?.[index]?.description && (
                      <p className={errorClassName}>{errors.days[index]?.description?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hotels Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Hotels</h3>
            {hotelFields.map((field, index) => (
              <div
                key={field.id}
                className="mb-6 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Hotel {index + 1}</h4>
                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>
                      Place Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`hotels.${index}.placeName`)}
                      type="text"
                      placeholder="Enter place name (e.g., Manali, Shimla)"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotels?.[index]?.placeName && (
                      <p className={errorClassName}>{errors.hotels[index]?.placeName?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Night Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`hotels.${index}.placeDescription`)}
                      placeholder="Example: 1st Night, 2nd Night"
                      rows={2}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotels?.[index]?.placeDescription && (
                      <p className={errorClassName}>{errors.hotels[index]?.placeDescription?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Hotel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`hotels.${index}.hotelName`)}
                      type="text"
                      placeholder="Enter hotel name"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotels?.[index]?.hotelName && (
                      <p className={errorClassName}>{errors.hotels[index]?.hotelName?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`hotels.${index}.roomType`)}
                      className={inputClassName}
                      disabled={isSubmitting}
                    >
                      <option value="">Select room type</option>
                      {ROOM_TYPES.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                    {errors.hotels?.[index]?.roomType && (
                      <p className={errorClassName}>{errors.hotels[index]?.roomType?.message}</p>
                    )}

                    {/* Custom Room Type Input */}
                    {hotelRoomTypeCustom[index] && (
                      <div className="mt-3">
                        <input
                          {...register(`hotels.${index}.roomTypeCustom`)}
                          type="text"
                          placeholder="Enter custom room type"
                          className={inputClassName}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Hotel Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`hotels.${index}.hotelDescription`)}
                      placeholder="Enter hotel description, amenities, etc."
                      rows={3}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotels?.[index]?.hotelDescription && (
                      <p className={errorClassName}>{errors.hotels[index]?.hotelDescription?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inclusions Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-purple-600">Inclusions</h3>
              <button
                type="button"
                onClick={addInclusion}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Single
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Clipboard className="h-5 w-5 text-blue-600" />
                <label className="font-semibold text-blue-700 dark:text-blue-300">
                  Bulk Add Inclusions (Paste multiple lines)
                </label>
              </div>
              <textarea
                value={bulkInclusionText}
                onChange={(e) => setBulkInclusionText(e.target.value)}
                placeholder="Paste multiple inclusions here (one per line)&#10;Example:&#10;Welcome drinks on arrival&#10;Daily breakfast&#10;All transfers"
                rows={4}
                className={`${inputClassName} mb-2`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleBulkInclusionsPaste}
                disabled={isSubmitting || !bulkInclusionText.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Add All Lines
              </button>
            </div>

            <div className="space-y-3">
              {inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      value={inclusion}
                      onChange={(e) => updateInclusion(index, e.target.value)}
                      type="text"
                      placeholder={`Inclusion ${index + 1}`}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    disabled={isSubmitting || inclusions.length === 1}
                    className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-purple-600">Exclusions</h3>
              <button
                type="button"
                onClick={addExclusion}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Single
              </button>
            </div>

            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-3">
                <Clipboard className="h-5 w-5 text-orange-600" />
                <label className="font-semibold text-orange-700 dark:text-orange-300">
                  Bulk Add Exclusions (Paste multiple lines)
                </label>
              </div>
              <textarea
                value={bulkExclusionText}
                onChange={(e) => setBulkExclusionText(e.target.value)}
                placeholder="Paste multiple exclusions here (one per line)&#10;Example:&#10;Airfare not included&#10;Personal expenses&#10;Travel insurance"
                rows={4}
                className={`${inputClassName} mb-2`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleBulkExclusionsPaste}
                disabled={isSubmitting || !bulkExclusionText.trim()}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Add All Lines
              </button>
            </div>

            <div className="space-y-3">
              {exclusions.map((exclusion, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      value={exclusion}
                      onChange={(e) => updateExclusion(index, e.target.value)}
                      type="text"
                      placeholder={`Exclusion ${index + 1}`}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExclusion(index)}
                    disabled={isSubmitting || exclusions.length === 1}
                    className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6 flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="py-4 px-10 bg-gray-500 rounded-lg font-semibold text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-4 px-10 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
            >
              {isSubmitting ? 'Creating Itinerary...' : 'Generate Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
