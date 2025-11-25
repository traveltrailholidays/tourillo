'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import * as z from 'zod';
import { createItinerary, generateNewTravelId, getItineraryForClone } from '@/lib/actions/itinerary-actions';
import { Upload, Trash2, Image as ImageIcon, Plus, Minus, Copy, RefreshCw, Search, X, FileCode } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS, ROOM_TYPES, CAB_OPTIONS } from '@/data/itinerary';
import { Button } from '@/components/ui/button';

// Image compression function
export const compressImage = async (file: File): Promise<File> => {
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

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          0.85
        );
      };

      img.onerror = () => {
        reject(new Error('Image loading failed'));
      };
    };

    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
  });
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const compressedFile = await compressImage(file);
  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

const ItinerarySchema = z.object({
  travelId: z.string().min(1, 'Travel ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  packageTitle: z.string().min(1, 'Package title is required'),
  numberOfDays: z.number().min(1),
  numberOfNights: z.number().min(0),
  numberOfHotels: z.number().min(1),
  tripAdvisorName: z.string().min(1, 'Trip advisor name is required'),
  tripAdvisorNumber: z.string().min(1, 'Trip advisor number is required'),
  cabs: z.string().min(1, 'Cab details required'),
  flights: z.string().min(1, 'Flight details required'),
  quotePrice: z.number().min(0),
  pricePerPerson: z.number().min(0),
  days: z.array(
    z.object({
      dayNumber: z.number(),
      summary: z.string().min(1, 'Summary is required'),
      imageSrc: z.string(),
      description: z.string().min(1, 'Description is required'),
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
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
});

type ItineraryFormValues = z.infer<typeof ItinerarySchema>;

interface CreateItineraryProps {
  itinerariesForClone?: Array<{
    travelId: string;
    clientName: string;
    packageTitle: string;
    numberOfDays: number;
    numberOfNights: number;
  }>;
}

const CreateItinerary = ({ itinerariesForClone = [] }: CreateItineraryProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [dayImagePreviews, setDayImagePreviews] = useState<{ [key: number]: string }>({});
  const [compressedImages, setCompressedImages] = useState<{ [key: number]: File }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});
  const [inclusions, setInclusions] = useState<string[]>([...DEFAULT_INCLUSIONS]);
  const [exclusions, setExclusions] = useState<string[]>([...DEFAULT_EXCLUSIONS]);

  // Clone feature states
  const [searchTerm, setSearchTerm] = useState('');
  const [showCloneDropdown, setShowCloneDropdown] = useState(false);
  const [selectedCloneId, setSelectedCloneId] = useState<string | null>(null);
  const cloneDropdownRef = useRef<HTMLDivElement>(null);

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
      flights: '',
      quotePrice: 0,
      pricePerPerson: 0,
      days: [{ dayNumber: 1, summary: '', imageSrc: '', description: '' }],
      hotels: [
        {
          placeName: '',
          placeDescription: '',
          hotelName: '',
          roomType: '',
          roomTypeCustom: '',
          hotelDescription: '',
        },
      ],
      inclusions: [...DEFAULT_INCLUSIONS],
      exclusions: [...DEFAULT_EXCLUSIONS],
    },
  });

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
    replace: replaceDays,
  } = useFieldArray({
    control,
    name: 'days',
  });

  const {
    fields: hotelFields,
    append: appendHotel,
    remove: removeHotel,
    replace: replaceHotels,
  } = useFieldArray({
    control,
    name: 'hotels',
  });

  const numberOfDays = watch('numberOfDays');
  const numberOfHotels = watch('numberOfHotels');

  // Generate Travel ID on mount
  useEffect(() => {
    const initTravelId = async () => {
      const newId = await generateNewTravelId();
      setValue('travelId', newId);
    };
    initTravelId();
  }, [setValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cloneDropdownRef.current && !cloneDropdownRef.current.contains(event.target as Node)) {
        setShowCloneDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-load clone from URL parameter
  useEffect(() => {
    const cloneTravelId = searchParams.get('clone');
    if (cloneTravelId && !selectedCloneId) {
      handleCloneSelect(cloneTravelId);
    }
  }, [searchParams]);

  // Filter itineraries for clone dropdown
  const filteredItineraries = React.useMemo(() => {
    if (!searchTerm.trim()) return itinerariesForClone;

    const search = searchTerm.toLowerCase();
    return itinerariesForClone.filter(
      (itinerary) =>
        itinerary.travelId.toLowerCase().includes(search) ||
        itinerary.clientName.toLowerCase().includes(search) ||
        itinerary.packageTitle.toLowerCase().includes(search)
    );
  }, [itinerariesForClone, searchTerm]);

  // Handle clone selection
  const handleCloneSelect = async (travelId: string) => {
    try {
      toast.loading('Loading itinerary data...', { id: 'clone-loading' });

      const itineraryData = await getItineraryForClone(travelId);

      if (!itineraryData) {
        toast.error('Failed to load itinerary data', { id: 'clone-loading' });
        return;
      }

      // Generate new Travel ID
      const newTravelId = await generateNewTravelId();

      // Pre-fill all form fields
      setValue('travelId', newTravelId);
      setValue('clientName', itineraryData.clientName);
      setValue('clientPhone', itineraryData.clientPhone);
      setValue('clientEmail', itineraryData.clientEmail || '');
      setValue('packageTitle', itineraryData.packageTitle);
      setValue('numberOfDays', itineraryData.numberOfDays);
      setValue('numberOfNights', itineraryData.numberOfNights);
      setValue('numberOfHotels', itineraryData.numberOfHotels);
      setValue('tripAdvisorName', itineraryData.tripAdvisorName);
      setValue('tripAdvisorNumber', itineraryData.tripAdvisorNumber);
      setValue('cabs', itineraryData.cabs);
      setValue('flights', itineraryData.flights);
      setValue('quotePrice', itineraryData.quotePrice);
      setValue('pricePerPerson', itineraryData.pricePerPerson);

      // Set days and hotels
      replaceDays(itineraryData.days);
      replaceHotels(itineraryData.hotels);

      // Set inclusions and exclusions
      setInclusions(itineraryData.inclusions);
      setExclusions(itineraryData.exclusions);

      // Pre-fill day images
      const newImagePreviews: { [key: number]: string } = {};
      itineraryData.days.forEach((day: any, index: number) => {
        if (day.imageSrc) {
          newImagePreviews[index] = day.imageSrc;
          setValue(`days.${index}.imageSrc`, day.imageSrc);
        }
      });
      setDayImagePreviews(newImagePreviews);

      setSelectedCloneId(travelId);
      setShowCloneDropdown(false);

      const selected = itinerariesForClone.find((i) => i.travelId === travelId);
      if (selected) {
        setSearchTerm(`${travelId} - ${selected.clientName}`);
      }

      toast.success('Itinerary data loaded! Update as needed and create.', { id: 'clone-loading' });
    } catch (error) {
      toast.error('Failed to load itinerary data', { id: 'clone-loading' });
      console.error(error);
    }
  };

  // Clear clone selection
  const handleClearClone = async () => {
    setSearchTerm('');
    setSelectedCloneId(null);
    setDayImagePreviews({});
    setCompressedImages({});

    // Generate new travel ID
    const newId = await generateNewTravelId();
    setValue('travelId', newId);

    // Reset to defaults
    setValue('clientName', '');
    setValue('clientPhone', '');
    setValue('clientEmail', '');
    setValue('packageTitle', '');
    setValue('numberOfDays', 1);
    setValue('numberOfNights', 0);
    setValue('numberOfHotels', 1);
    setValue('tripAdvisorName', '');
    setValue('tripAdvisorNumber', '');
    setValue('cabs', '');
    setValue('flights', '');
    setValue('quotePrice', 0);
    setValue('pricePerPerson', 0);

    replaceDays([{ dayNumber: 1, summary: '', imageSrc: '', description: '' }]);
    replaceHotels([
      {
        placeName: '',
        placeDescription: '',
        hotelName: '',
        roomType: '',
        roomTypeCustom: '',
        hotelDescription: '',
      },
    ]);
    setInclusions([...DEFAULT_INCLUSIONS]);
    setExclusions([...DEFAULT_EXCLUSIONS]);
  };

  const handleGenerateTravelId = async () => {
    setIsGeneratingId(true);
    try {
      const newTravelId = await generateNewTravelId();
      setValue('travelId', newTravelId);
      toast.success('Travel ID generated successfully!');
    } catch (error) {
      toast.error('Failed to generate Travel ID');
    } finally {
      setIsGeneratingId(false);
    }
  };

  const handleCopyTravelId = () => {
    const travelId = watch('travelId');
    if (travelId) {
      navigator.clipboard.writeText(travelId);
      toast.success('Travel ID copied to clipboard!');
    }
  };

  useEffect(() => {
    const currentDays = watch('days');
    if (numberOfDays > currentDays.length) {
      const daysToAdd = numberOfDays - currentDays.length;
      for (let i = 0; i < daysToAdd; i++) {
        appendDay({
          dayNumber: currentDays.length + i + 1,
          summary: '',
          imageSrc: '',
          description: '',
        });
      }
    } else if (numberOfDays < currentDays.length) {
      const daysToRemove = currentDays.length - numberOfDays;
      for (let i = 0; i < daysToRemove; i++) {
        removeDay(currentDays.length - 1 - i);
      }
    }
  }, [numberOfDays]);

  useEffect(() => {
    const currentHotels = watch('hotels');
    if (numberOfHotels > currentHotels.length) {
      const hotelsToAdd = numberOfHotels - currentHotels.length;
      for (let i = 0; i < hotelsToAdd; i++) {
        appendHotel({
          placeName: '',
          placeDescription: '',
          hotelName: '',
          roomType: '',
          roomTypeCustom: '',
          hotelDescription: '',
        });
      }
    } else if (numberOfHotels < currentHotels.length) {
      const hotelsToRemove = currentHotels.length - numberOfHotels;
      for (let i = 0; i < hotelsToRemove; i++) {
        removeHotel(currentHotels.length - 1 - i);
      }
    }
  }, [numberOfHotels]);

  const handleImageSelect = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setCompressedImages((prev) => ({ ...prev, [index]: compressed }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setDayImagePreviews((prev) => ({ ...prev, [index]: reader.result as string }));
      };
      reader.readAsDataURL(compressed);

      toast.success('Image compressed and ready for upload!');
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  };

  const handleImageUpload = async (index: number) => {
    const file = compressedImages[index];
    if (!file) {
      toast.error('No image selected');
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [index]: true }));

    try {
      const imageUrl = await uploadToCloudinary(file);
      setValue(`days.${index}.imageSrc`, imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setValue(`days.${index}.imageSrc`, '');
    setDayImagePreviews((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setCompressedImages((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    toast.success('Image removed');
  };

  const addInclusion = () => {
    setInclusions([...inclusions, '']);
  };

  const removeInclusion = (index: number) => {
    const updated = inclusions.filter((_, i) => i !== index);
    setInclusions(updated);
  };

  const updateInclusion = (index: number, value: string) => {
    const updated = [...inclusions];
    updated[index] = value;
    setInclusions(updated);
  };

  const addExclusion = () => {
    setExclusions([...exclusions, '']);
  };

  const removeExclusion = (index: number) => {
    const updated = exclusions.filter((_, i) => i !== index);
    setExclusions(updated);
  };

  const updateExclusion = (index: number, value: string) => {
    const updated = [...exclusions];
    updated[index] = value;
    setExclusions(updated);
  };

  const onSubmit = async (data: ItineraryFormValues) => {
    setIsSubmitting(true);

    const finalData = {
      ...data,
      inclusions: inclusions.filter((inc) => inc.trim() !== ''),
      exclusions: exclusions.filter((exc) => exc.trim() !== ''),
    };

    try {
      await createItinerary(finalData);
      toast.success('Itinerary created successfully!');
      router.push('/admin/itinerary/itinerary-list');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create itinerary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'w-full p-3 border-2 border-gray-300 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-foreground';
  const labelClassName = 'block text-sm font-semibold mb-2';
  const errorClassName = 'text-red-500 text-sm mt-1';

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Itinerary</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Design detailed travel itineraries in minutes</p>
      </div>
      <div className="bg-foreground rounded-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Clone from Existing Section - NEW */}
          {itinerariesForClone.length > 0 && (
            <>
              <div className="p-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-sm border-2 border-green-200 dark:border-green-700">
                <label className={labelClassName}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileCode className="h-4 w-4" />
                    Clone from Existing Itinerary (Optional)
                  </div>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Select an existing itinerary to pre-fill all fields. You can modify any field before creating.
                </p>

                <div className="relative" ref={cloneDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by Travel ID, Client Name, or Package Title..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!selectedCloneId) setShowCloneDropdown(true);
                      }}
                      onFocus={() => !selectedCloneId && setShowCloneDropdown(true)}
                      disabled={!!selectedCloneId}
                      className={`${inputClassName} pl-10 pr-10 ${selectedCloneId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {selectedCloneId && (
                      <button
                        type="button"
                        onClick={handleClearClone}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Clone Dropdown */}
                  {showCloneDropdown && !selectedCloneId && (
                    <div className="absolute z-50 w-full mt-2 bg-foreground border-2 border-green-200 dark:border-green-700 rounded-sm shadow-2xl max-h-80 overflow-y-auto">
                      {filteredItineraries.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400">No itineraries found</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Try adjusting your search terms
                          </p>
                        </div>
                      ) : (
                        <>
                          {filteredItineraries.map((itinerary, index) => (
                            <button
                              key={itinerary.travelId}
                              type="button"
                              onClick={() => handleCloneSelect(itinerary.travelId)}
                              className={`w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                index !== filteredItineraries.length - 1
                                  ? 'border-b border-gray-200 dark:border-gray-700'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                      {itinerary.travelId}
                                    </span>
                                    <span className="font-semibold truncate">{itinerary.clientName}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                    {itinerary.packageTitle}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {itinerary.numberOfNights}N / {itinerary.numberOfDays}D
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Show message if cloned */}
              {selectedCloneId && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <FileCode className="h-5 w-5" />
                    <p className="font-medium">
                      Itinerary data loaded from {selectedCloneId}. Update any fields below and click Generate
                      Itinerary.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Travel ID Section */}
          <div className="">
            <label className={labelClassName}>
              Travel ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input {...register('travelId')} type="text" className={inputClassName} disabled={isSubmitting} />
              <Button
                type="button"
                onClick={handleGenerateTravelId}
                disabled={isGeneratingId || isSubmitting}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isGeneratingId ? 'animate-spin' : ''}`} />
                Generate
              </Button>
              <Button
                type="button"
                onClick={handleCopyTravelId}
                disabled={isSubmitting}
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {errors.travelId && <p className={errorClassName}>{errors.travelId.message}</p>}
          </div>

          {/* Client Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-purple-600">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input {...register('clientName')} type="text" className={inputClassName} disabled={isSubmitting} />
                {errors.clientName && <p className={errorClassName}>{errors.clientName.message}</p>}
              </div>

              <div>
                <label className={labelClassName}>
                  Client Phone <span className="text-red-500">*</span>
                </label>
                <input {...register('clientPhone')} type="tel" className={inputClassName} disabled={isSubmitting} />
                {errors.clientPhone && <p className={errorClassName}>{errors.clientPhone.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>Client Email</label>
                <input {...register('clientEmail')} type="email" className={inputClassName} disabled={isSubmitting} />
                {errors.clientEmail && <p className={errorClassName}>{errors.clientEmail.message}</p>}
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Package Details</h3>
            <div className="space-y-6">
              <div>
                <label className={labelClassName}>
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input {...register('packageTitle')} type="text" className={inputClassName} disabled={isSubmitting} />
                {errors.packageTitle && <p className={errorClassName}>{errors.packageTitle.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClassName}>
                    Number of Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('numberOfDays', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.numberOfDays && <p className={errorClassName}>{errors.numberOfDays.message}</p>}
                </div>

                <div>
                  <label className={labelClassName}>
                    Number of Nights <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('numberOfNights', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.numberOfNights && <p className={errorClassName}>{errors.numberOfNights.message}</p>}
                </div>

                <div>
                  <label className={labelClassName}>
                    Number of Hotels <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('numberOfHotels', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.numberOfHotels && <p className={errorClassName}>{errors.numberOfHotels.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    Quote Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('quotePrice', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.quotePrice && <p className={errorClassName}>{errors.quotePrice.message}</p>}
                </div>

                <div>
                  <label className={labelClassName}>
                    Price Per Person (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('pricePerPerson', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.pricePerPerson && <p className={errorClassName}>{errors.pricePerPerson.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Advisor Details */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Trip Advisor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>
                  Trip Advisor Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('tripAdvisorName')}
                  type="text"
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
                  type="tel"
                  className={inputClassName}
                  disabled={isSubmitting}
                />
                {errors.tripAdvisorNumber && <p className={errorClassName}>{errors.tripAdvisorNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* Transportation Details */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Transportation Details</h3>
            <div className="space-y-6">
              <div>
                <label className={labelClassName}>
                  Cab Details <span className="text-red-500">*</span>
                </label>
                <select {...register('cabs')} className={inputClassName} disabled={isSubmitting}>
                  <option value="">Select Cab Type</option>
                  {CAB_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.cabs && <p className={errorClassName}>{errors.cabs.message}</p>}
              </div>

              <div>
                <label className={labelClassName}>
                  Flight Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('flights')}
                  rows={3}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="Enter flight details..."
                />
                {errors.flights && <p className={errorClassName}>{errors.flights.message}</p>}
              </div>
            </div>
          </div>

          {/* Daily Itinerary */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Daily Itinerary</h3>
            {dayFields.map((field, index) => (
              <div
                key={field.id}
                className="mb-6 p-6 border-2 border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900"
              >
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Day {index + 1}</h4>

                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>
                      Day Summary <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`days.${index}.summary`)}
                      type="text"
                      className={inputClassName}
                      disabled={isSubmitting}
                      placeholder="e.g., Arrival in Delhi - City Tour"
                    />
                    {errors.days?.[index]?.summary && (
                      <p className={errorClassName}>{errors.days[index]?.summary?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>Day Image</label>
                    <div className="flex gap-4 items-start flex-wrap">
                      {dayImagePreviews[index] || watch(`days.${index}.imageSrc`) ? (
                        <div className="relative w-48 h-32 rounded-sm overflow-hidden border-2 border-gray-300">
                          <Image
                            src={dayImagePreviews[index] || watch(`days.${index}.imageSrc`)}
                            alt={`Day ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            disabled={isSubmitting}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-purple-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageSelect(index, file);
                            }}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Select Image</span>
                        </label>
                      )}

                      {compressedImages[index] && !watch(`days.${index}.imageSrc`) && (
                        <Button
                          type="button"
                          onClick={() => handleImageUpload(index)}
                          disabled={uploadingImages[index] || isSubmitting}
                          className="flex items-center gap-2"
                        >
                          {uploadingImages[index] ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload to Cloud
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Image will be compressed automatically before upload</p>
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Day Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`days.${index}.description`)}
                      rows={4}
                      className={inputClassName}
                      disabled={isSubmitting}
                      placeholder="Detailed description of the day's activities..."
                    />
                    {errors.days?.[index]?.description && (
                      <p className={errorClassName}>{errors.days[index]?.description?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hotels */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600">Hotel Details</h3>
            {hotelFields.map((field, index) => (
              <div
                key={field.id}
                className="mb-6 p-6 border-2 border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900"
              >
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Hotel {index + 1}</h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClassName}>
                        Place Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`hotels.${index}.placeName`)}
                        type="text"
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.hotels?.[index]?.placeName && (
                        <p className={errorClassName}>{errors.hotels[index]?.placeName?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Place Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`hotels.${index}.placeDescription`)}
                        type="text"
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.hotels?.[index]?.placeDescription && (
                        <p className={errorClassName}>{errors.hotels[index]?.placeDescription?.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClassName}>
                        Hotel Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`hotels.${index}.hotelName`)}
                        type="text"
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
                        <option value="">Select Room Type</option>
                        {ROOM_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.hotels?.[index]?.roomType && (
                        <p className={errorClassName}>{errors.hotels[index]?.roomType?.message}</p>
                      )}
                    </div>
                  </div>

                  {watch(`hotels.${index}.roomType`) === 'Custom (Enter below)' && (
                    <div>
                      <label className={labelClassName}>Custom Room Type</label>
                      <input
                        {...register(`hotels.${index}.roomTypeCustom`)}
                        type="text"
                        className={inputClassName}
                        disabled={isSubmitting}
                        placeholder="Enter custom room type"
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelClassName}>
                      Hotel Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`hotels.${index}.hotelDescription`)}
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

          {/* Inclusions */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Inclusions</h3>
            {inclusions.map((inclusion, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={inclusion}
                  onChange={(e) => updateInclusion(index, e.target.value)}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="Enter inclusion"
                />
                <Button
                  type="button"
                  onClick={() => removeInclusion(index)}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="shrink-0 cursor-pointer"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addInclusion}
              disabled={isSubmitting}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Add Inclusion
            </Button>
          </div>

          {/* Exclusions */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Exclusions</h3>
            {exclusions.map((exclusion, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={exclusion}
                  onChange={(e) => updateExclusion(index, e.target.value)}
                  className={inputClassName}
                  disabled={isSubmitting}
                  placeholder="Enter exclusion"
                />
                <Button
                  type="button"
                  onClick={() => removeExclusion(index)}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="shrink-0 cursor-pointer"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addExclusion}
              disabled={isSubmitting}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Add Exclusion
            </Button>
          </div>

          {/* Submit Button */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 flex gap-4 justify-end">
            <Button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              variant="outline"
              className="cursor-pointer py-4 px-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="py-4 px-10 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform cursor-pointer"
            >
              {isSubmitting ? 'Creating Itinerary...' : 'Generate Itinerary'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItinerary;
