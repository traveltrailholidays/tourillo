'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { createItinerary } from '@/lib/actions/itinerary-actions';
import { Upload, Trash2, Image as ImageIcon, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

// Zod schema for form validation
const ItinerarySchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  packageTitle: z.string().min(1, 'Package title is required'),
  numberOfDays: z.number().min(1, 'Number of days must be at least 1'),
  numberOfNights: z.number(),
  numberOfHotels: z.number().min(1, 'Number of hotels must be at least 1'),
  tripAdvisorName: z.string().min(1, 'Trip advisor name is required'),
  tripAdvisorNumber: z.string().min(1, 'Trip advisor number is required'),
  cabs: z.string().min(1, 'Cabs details are required'),
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
      hotelDescription: z.string().min(1, 'Hotel description is required'),
    })
  ),
  inclusions: z.array(
    z.object({
      value: z.string().min(1, 'Inclusion value is required'),
    })
  ),
  exclusions: z.array(
    z.object({
      value: z.string().min(1, 'Exclusion value is required'),
    })
  ),
});

type ItineraryFormValues = z.infer<typeof ItinerarySchema>;

const DEFAULT_VALUES: ItineraryFormValues = {
  clientName: '',
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
    hotelDescription: '',
  })),
  inclusions: [{ value: '' }],
  exclusions: [{ value: '' }],
};

export default function CreateItinerary() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dayImagePreviews, setDayImagePreviews] = useState<{ [key: number]: string }>({});
  const [dayDragActive, setDayDragActive] = useState<{ [key: number]: boolean }>({});
  const dayFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItineraryFormValues>({
    resolver: zodResolver(ItinerarySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields: hotelFields, replace: replaceHotels } = useFieldArray({
    control,
    name: 'hotels',
  });

  const {
    fields: inclusionFields,
    append: appendInclusion,
    remove: removeInclusion,
  } = useFieldArray({
    control,
    name: 'inclusions',
  });

  const {
    fields: exclusionFields,
    append: appendExclusion,
    remove: removeExclusion,
  } = useFieldArray({
    control,
    name: 'exclusions',
  });

  const { fields: dayFields, replace: replaceDays } = useFieldArray({
    control,
    name: 'days',
  });

  const numberOfDays = watch('numberOfDays');
  const numberOfHotels = watch('numberOfHotels');

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
        hotelDescription: currentHotels[index]?.hotelDescription || '',
      }));
      replaceHotels(newHotels);
    }
  }, [numberOfHotels, replaceHotels, watch]);

  const processImageFile = (file: File | undefined, dayIndex: number) => {
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
      const result = event.target?.result as string;
      setDayImagePreviews((prev) => ({ ...prev, [dayIndex]: result }));
      setValue(`days.${dayIndex}.imageSrc`, result);
    };
    reader.readAsDataURL(file);
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

      if (dayFileInputRefs.current[dayIndex]) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        dayFileInputRefs.current[dayIndex]!.files = dataTransfer.files;
      }
    }
  };

  const handleRemoveDayImage = (dayIndex: number) => {
    setDayImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[dayIndex];
      return newPreviews;
    });
    setValue(`days.${dayIndex}.imageSrc`, '');
    if (dayFileInputRefs.current[dayIndex]) {
      dayFileInputRefs.current[dayIndex]!.value = '';
    }
  };

  const onSubmit = async (data: ItineraryFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createItinerary(data);
      toast.success(`Itinerary created! Travel ID: ${result.travelId}`);

      // Open in new tab
      window.open(`/itinerary/view/${result.travelId}`, '_blank');

      // Redirect to list
      router.push('/admin/itinerary/itinerary-list');
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
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Itinerary
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>
                Client&apos;s Name <span className="text-red-500">*</span>
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
              <input
                {...register('cabs')}
                type="text"
                placeholder="Enter cab details"
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.cabs && <p className={errorClassName}>{errors.cabs.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Flights Details <span className="text-red-500">*</span>
              </label>
              <input
                {...register('flights')}
                type="text"
                placeholder="Enter flight details"
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
                Quote Price <span className="text-red-500">*</span>
              </label>
              <input
                {...register('quotePrice', { valueAsNumber: true })}
                type="number"
                placeholder="Enter quote price"
                className={inputClassName}
                min={0}
                disabled={isSubmitting}
              />
              {errors.quotePrice && <p className={errorClassName}>{errors.quotePrice.message}</p>}
            </div>

            <div>
              <label className={labelClassName}>
                Price per person <span className="text-red-500">*</span>
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

          {/* Days Section with Image Upload */}
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
                      placeholder={`Summary for Day ${index + 1}`}
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
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => dayFileInputRefs.current[index]?.click()}
                              disabled={isSubmitting}
                              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                              title="Replace Image"
                            >
                              <Upload className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDayImage(index)}
                              disabled={isSubmitting}
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
                          <p className="text-sm text-gray-500">JPEG, PNG, or WebP (max 10MB)</p>
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
                      placeholder="Detailed description"
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
              <div key={field.id} className="mb-6 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Hotel {index + 1}</h4>
                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>
                      Place Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`hotels.${index}.placeName`)}
                      type="text"
                      placeholder="Enter place name"
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
                    <input
                      {...register(`hotels.${index}.roomType`)}
                      type="text"
                      placeholder="Enter room type"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotels?.[index]?.roomType && (
                      <p className={errorClassName}>{errors.hotels[index]?.roomType?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Hotel Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`hotels.${index}.hotelDescription`)}
                      placeholder="Enter hotel description"
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
                onClick={() => appendInclusion({ value: '' })}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inclusion
              </button>
            </div>
            {inclusionFields.map((field, index) => (
              <div key={field.id} className="mb-4 flex gap-4">
                <div className="flex-1">
                  <input
                    {...register(`inclusions.${index}.value`)}
                    type="text"
                    placeholder={`Inclusion ${index + 1}`}
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.inclusions?.[index]?.value && (
                    <p className={errorClassName}>{errors.inclusions[index]?.value?.message}</p>
                  )}
                </div>
                {inclusionFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    disabled={isSubmitting}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Exclusions Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-purple-600">Exclusions</h3>
              <button
                type="button"
                onClick={() => appendExclusion({ value: '' })}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exclusion
              </button>
            </div>
            {exclusionFields.map((field, index) => (
              <div key={field.id} className="mb-4 flex gap-4">
                <div className="flex-1">
                  <input
                    {...register(`exclusions.${index}.value`)}
                    type="text"
                    placeholder={`Exclusion ${index + 1}`}
                    className={inputClassName}
                    disabled={isSubmitting}
                  />
                  {errors.exclusions?.[index]?.value && (
                    <p className={errorClassName}>{errors.exclusions[index]?.value?.message}</p>
                  )}
                </div>
                {exclusionFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExclusion(index)}
                    disabled={isSubmitting}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-4 px-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
            >
              {isSubmitting ? 'Creating Itinerary...' : 'Generate Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
