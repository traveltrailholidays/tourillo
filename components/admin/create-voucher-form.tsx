'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { createVoucher, getItineraryForVoucher } from '@/lib/actions/voucher-actions';
import toast from 'react-hot-toast';
import { Search, X, Calendar, Users, Hotel, Car } from 'lucide-react';

const VoucherSchema = z.object({
  travelId: z.string().min(1, 'Travel ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  adultNo: z.number().min(1, 'At least 1 adult is required'),
  childrenNo: z.number().min(0),
  totalNights: z.number().min(0, 'Nights cannot be negative'),
  hotelStays: z.array(
    z.object({
      hotelName: z.string().min(1, 'Hotel name is required'),
      nights: z.number().min(0),
      fromDate: z.string().min(1, 'From date is required'),
      toDate: z.string().min(1, 'To date is required'),
      description: z.string().min(1, 'Description is required'),
    })
  ),
  cabDetails: z.string().min(1, 'Cab details are required'),
});

type VoucherFormValues = z.infer<typeof VoucherSchema>;

interface CreateVoucherFormProps {
  itineraries: Array<{
    travelId: string;
    clientName: string;
    packageTitle: string;
    clientPhone: string;
    clientEmail: string | null;
  }>;
}

export default function CreateVoucherForm({ itineraries }: CreateVoucherFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(VoucherSchema),
    defaultValues: {
      travelId: '',
      clientName: '',
      adultNo: 1,
      childrenNo: 0,
      totalNights: 0,
      hotelStays: [{ hotelName: '', nights: 0, fromDate: '', toDate: '', description: '' }],
      cabDetails: '',
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'hotelStays',
  });

  const totalNights = watch('totalNights');
  const travelId = watch('travelId');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter itineraries based on search
  const filteredItineraries = useMemo(() => {
    if (!searchTerm.trim()) return itineraries;

    const search = searchTerm.toLowerCase();
    return itineraries.filter(
      (itinerary) =>
        itinerary.travelId.toLowerCase().includes(search) ||
        itinerary.clientName.toLowerCase().includes(search) ||
        itinerary.clientPhone.toLowerCase().includes(search) ||
        itinerary.packageTitle.toLowerCase().includes(search) ||
        itinerary.clientEmail?.toLowerCase().includes(search)
    );
  }, [itineraries, searchTerm]);

  // Handle itinerary selection
  const handleSelectItinerary = useCallback(
    async (selectedTravelId: string) => {
      setValue('travelId', selectedTravelId);
      setShowDropdown(false);

      const selected = itineraries.find((i) => i.travelId === selectedTravelId);
      if (selected) {
        setSearchTerm(`${selectedTravelId} - ${selected.clientName}`);
      }

      // Fetch full itinerary details
      const itinerary = await getItineraryForVoucher(selectedTravelId);
      if (itinerary) {
        setSelectedItinerary(itinerary);
        setValue('clientName', itinerary.clientName);
        setValue('totalNights', itinerary.numberOfNights);
        setValue('cabDetails', itinerary.cabs);

        // Pre-fill hotel stays from itinerary
        const hotels = itinerary.hotels as any[];
        if (Array.isArray(hotels)) {
          const hotelStays = hotels.map((hotel) => ({
            hotelName: hotel.hotelName || '',
            nights: 0,
            fromDate: '',
            toDate: '',
            description: hotel.hotelDescription || '',
          }));
          replace(hotelStays);
        }
      }
    },
    [itineraries, setValue, replace]
  );

  // Handle night change with validation
  const handleNightChange = useCallback(
    (index: number, value: number) => {
      const currentHotelStays = [...watch('hotelStays')];
      value = Math.max(0, value);

      const previousHotelsNights = currentHotelStays.slice(0, index).reduce((sum, hotel) => sum + hotel.nights, 0);
      const remainingNightsForCurrentAndNext = totalNights - previousHotelsNights;
      value = Math.min(value, remainingNightsForCurrentAndNext);

      currentHotelStays[index].nights = value;

      let remainingNights = remainingNightsForCurrentAndNext - value;

      for (let i = index + 1; i < currentHotelStays.length; i++) {
        if (i === currentHotelStays.length - 1) {
          currentHotelStays[i].nights = remainingNights;
        } else {
          const currentHotelNights = Math.min(currentHotelStays[i].nights || 0, remainingNights);
          currentHotelStays[i].nights = currentHotelNights;
          remainingNights -= currentHotelNights;
        }
      }

      replace(currentHotelStays);
    },
    [totalNights, watch, replace]
  );

  const onSubmit = async (data: VoucherFormValues) => {
    setIsSubmitting(true);
    try {
      await createVoucher(data);
      toast.success('Voucher created successfully!');
      router.push('/admin/voucher/voucher-list');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSearchTerm('');
    setSelectedItinerary(null);
    setValue('travelId', '');
    setValue('clientName', '');
    setValue('totalNights', 0);
    setValue('cabDetails', '');
    replace([{ hotelName: '', nights: 0, fromDate: '', toDate: '', description: '' }]);
  };

  const inputClassName =
    'w-full p-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 bg-foreground';
  const labelClassName = 'block text-sm font-semibold mb-2';
  const errorClassName = 'text-red-500 text-sm mt-1';

  return (
    <div className="container mx-auto p-6">
      <div className="bg-foreground rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Travel Voucher
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Travel ID Search Section */}
          <div className="p-6 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
            <label className={labelClassName}>
              Select Travel ID <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Travel ID, Client Name, Phone, Email, or Package..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!travelId) setShowDropdown(true);
                  }}
                  onFocus={() => !travelId && setShowDropdown(true)}
                  disabled={!!travelId}
                  className={`${inputClassName} pl-10 pr-10 ${travelId ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {travelId && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && !travelId && (
                <div className="absolute z-50 w-full mt-2 bg-foreground border-2 border-purple-200 dark:border-purple-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                  {filteredItineraries.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No itineraries found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <>
                      {filteredItineraries.map((itinerary, index) => (
                        <button
                          key={itinerary.travelId}
                          type="button"
                          onClick={() => handleSelectItinerary(itinerary.travelId)}
                          className={`w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            index !== filteredItineraries.length - 1
                              ? 'border-b border-gray-200 dark:border-gray-700'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                  {itinerary.travelId}
                                </span>
                                <span className="font-semibold truncate">{itinerary.clientName}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                {itinerary.packageTitle}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                <span>{itinerary.clientPhone}</span>
                                {itinerary.clientEmail && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{itinerary.clientEmail}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            {errors.travelId && <p className={errorClassName}>{errors.travelId.message}</p>}
          </div>

          {/* Selected Itinerary Details */}
          {selectedItinerary && (
            <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Selected Itinerary Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Travel ID</p>
                  <p className="font-mono font-bold">{selectedItinerary.travelId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Client Name</p>
                  <p className="font-semibold">{selectedItinerary.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                  <p className="font-medium">{selectedItinerary.clientPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Package</p>
                  <p className="font-medium">{selectedItinerary.packageTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Nights</p>
                  <p className="font-bold">{selectedItinerary.numberOfNights}</p>
                </div>
                {selectedItinerary.clientEmail && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="font-medium truncate">{selectedItinerary.clientEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guest Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-purple-600 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className={labelClassName}>
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('clientName')}
                  type="text"
                  placeholder="Enter client name"
                  className={inputClassName}
                  disabled={isSubmitting}
                />
                {errors.clientName && <p className={errorClassName}>{errors.clientName.message}</p>}
              </div>

              <div>
                <label className={labelClassName}>
                  Number of Adults <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('adultNo', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={inputClassName}
                  disabled={isSubmitting}
                />
                {errors.adultNo && <p className={errorClassName}>{errors.adultNo.message}</p>}
              </div>

              <div>
                <label className={labelClassName}>Number of Children</label>
                <input
                  {...register('childrenNo', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={inputClassName}
                  disabled={isSubmitting}
                />
                {errors.childrenNo && <p className={errorClassName}>{errors.childrenNo.message}</p>}
              </div>

              <div>
                <label className={labelClassName}>
                  Total Nights <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('totalNights', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  disabled={!!selectedItinerary || isSubmitting}
                  className={`${inputClassName} ${selectedItinerary ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
                {errors.totalNights && <p className={errorClassName}>{errors.totalNights.message}</p>}
              </div>
            </div>
          </div>

          {/* Hotel Stays Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600 flex items-center gap-2">
              <Hotel className="h-6 w-6" />
              Hotel Accommodations
            </h3>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="mb-6 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <h4 className="font-semibold text-lg mb-4 text-purple-600">Hotel {index + 1}</h4>
                <div className="space-y-4">
                  <div>
                    <label className={labelClassName}>
                      Hotel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`hotelStays.${index}.hotelName`)}
                      type="text"
                      placeholder="Enter hotel name"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotelStays?.[index]?.hotelName && (
                      <p className={errorClassName}>{errors.hotelStays[index]?.hotelName?.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClassName}>
                        Number of Nights <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`hotelStays.${index}.nights`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        onChange={(e) => handleNightChange(index, parseInt(e.target.value) || 0)}
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.hotelStays?.[index]?.nights && (
                        <p className={errorClassName}>{errors.hotelStays[index]?.nights?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Check-in Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`hotelStays.${index}.fromDate`)}
                        type="date"
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.hotelStays?.[index]?.fromDate && (
                        <p className={errorClassName}>{errors.hotelStays[index]?.fromDate?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Check-out Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`hotelStays.${index}.toDate`)}
                        type="date"
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.hotelStays?.[index]?.toDate && (
                        <p className={errorClassName}>{errors.hotelStays[index]?.toDate?.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Hotel Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register(`hotelStays.${index}.description`)}
                      rows={3}
                      placeholder="Enter hotel description, amenities, and additional details"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.hotelStays?.[index]?.description && (
                      <p className={errorClassName}>{errors.hotelStays[index]?.description?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transportation Section */}
          <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-600 flex items-center gap-2">
              <Car className="h-6 w-6" />
              Transportation Details
            </h3>
            <div>
              <label className={labelClassName}>
                Cab Details <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('cabDetails')}
                rows={4}
                placeholder="Enter transportation details, cab information, routes, etc."
                className={inputClassName}
                disabled={isSubmitting}
              />
              {errors.cabDetails && <p className={errorClassName}>{errors.cabDetails.message}</p>}
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
              {isSubmitting ? 'Creating Voucher...' : 'Create Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
