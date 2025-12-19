'use client';

import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { updateVoucher } from '@/lib/actions/voucher-actions';
import type { VoucherData } from '@/lib/actions/voucher-actions';
import toast from 'react-hot-toast';
import { Calendar, Users, Hotel, Car, Info } from 'lucide-react';
import { Button } from '../ui/button';

const VoucherSchema = z.object({
  travelId: z.string().min(1, 'Itinerary ID is required'),
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

interface EditVoucherFormProps {
  voucher: VoucherData;
  itineraries: Array<{
    travelId: string;
    clientName: string;
    packageTitle: string;
    clientPhone: string;
    clientEmail: string | null;
  }>;
}

export default function EditVoucherForm({ voucher, itineraries }: EditVoucherFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItinerary = itineraries.find((i) => i.travelId === voucher.travelId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(VoucherSchema),
    defaultValues: {
      travelId: voucher.travelId,
      clientName: voucher.clientName,
      adultNo: voucher.adultNo,
      childrenNo: voucher.childrenNo,
      totalNights: voucher.totalNights,
      hotelStays: voucher.hotelStays || [],
      cabDetails: voucher.cabDetails,
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'hotelStays',
  });

  const totalNights = watch('totalNights');
  const hotelStays = watch('hotelStays');

  const handleNightChange = useCallback(
    (index: number, value: number) => {
      if (hotelStays.length === 0) return;

      const currentHotelStays = [...hotelStays];
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
    [totalNights, hotelStays, replace]
  );

  const onSubmit = async (data: VoucherFormValues) => {
    setIsSubmitting(true);
    try {
      await updateVoucher(voucher.id, data);
      toast.success('Voucher updated successfully!');
      router.push('/admin/voucher/voucher-list');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update voucher');
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Voucher</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update voucher details for {voucher.voucherId}</p>
      </div>
      <div className="bg-foreground rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Voucher & Itinerary Information */}
          <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Voucher & Itinerary Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Voucher ID</p>
                <p className="font-mono font-bold text-green-600 dark:text-green-400">{voucher.voucherId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Itinerary ID</p>
                <p className="font-mono font-bold text-purple-600 dark:text-purple-400">{voucher.travelId}</p>
              </div>
              {selectedItinerary && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Package</p>
                    <p className="font-medium">{selectedItinerary.packageTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                    <p className="font-medium">{selectedItinerary.clientPhone}</p>
                  </div>
                  {selectedItinerary.clientEmail && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                      <p className="font-medium">{selectedItinerary.clientEmail}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

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
                  className={inputClassName}
                  disabled={isSubmitting}
                />
                {errors.totalNights && <p className={errorClassName}>{errors.totalNights.message}</p>}
              </div>
            </div>
          </div>

          {/* Hotel Stays Section */}
          {hotelStays.length > 0 ? (
            <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
              <h3 className="text-2xl font-bold mb-6 text-purple-600 flex items-center gap-2">
                <Hotel className="h-6 w-6" />
                Hotel Accommodations
                <span className="text-sm text-gray-500 font-normal">
                  ({hotelStays.length} hotel{hotelStays.length !== 1 ? 's' : ''})
                </span>
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
          ) : (
            <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      No Hotel Accommodations
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This voucher doesn't include hotel accommodations. It covers transportation and other services
                      only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <Button
              type="button"
              onClick={() => router.push('/admin/voucher/voucher-list')}
              disabled={isSubmitting}
              className="py-3 px-8 bg-gray-500 rounded-lg font-semibold text-white hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
            >
              {isSubmitting ? 'Updating Voucher...' : 'Update Voucher'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
