'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface HotelStay {
  hotelName: string;
  nights: number;
  fromDate: string;
  toDate: string;
  description: string;
}

export interface VoucherData {
  id: string;
  voucherId: string;
  travelId: string; // ✅ Added for form compatibility
  itineraryTravelId: string;
  clientName: string;
  adultNo: number;
  childrenNo: number;
  totalNights: number;
  hotelStays: HotelStay[];
  cabDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherConfirmationData {
  existingVouchersCount: number;
  itinerary: {
    travelId: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string | null;
    packageTitle: string;
    numberOfNights: number;
    numberOfHotels: number;
  };
  nextVoucherId: string;
}

const voucherSchema = z.object({
  travelId: z.string().min(1, 'Itinerary ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  adultNo: z.number().min(1, 'At least 1 adult is required'),
  childrenNo: z.number().min(0),
  totalNights: z.number().min(0, 'Nights cannot be negative'),
  hotelStays: z.array(z.any()).default([]),
  cabDetails: z.string().min(1, 'Cab details are required'),
});

// Generate voucher ID based on itinerary travelId
function generateVoucherId(itineraryTravelId: string, voucherCount: number): string {
  const companyPrefix = itineraryTravelId.substring(0, 3); // TRL or TTH
  const remainingId = itineraryTravelId.substring(3);
  const voucherNumber = (voucherCount + 1).toString().padStart(3, '0');
  return `${companyPrefix}C${remainingId}${voucherNumber}`;
}

// Check if vouchers exist and get confirmation data
export async function checkVoucherExists(travelId: string): Promise<VoucherConfirmationData | null> {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId },
      select: {
        travelId: true,
        clientName: true,
        clientPhone: true,
        clientEmail: true,
        packageTitle: true,
        numberOfNights: true,
        numberOfHotels: true,
      },
    });

    if (!itinerary) {
      throw new Error(`Itinerary with Itinerary ID ${travelId} not found`);
    }

    const existingVouchersCount = await prisma.voucher.count({
      where: { itineraryTravelId: travelId },
    });

    const nextVoucherId = generateVoucherId(travelId, existingVouchersCount);

    return {
      existingVouchersCount,
      itinerary,
      nextVoucherId,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to check voucher existence');
  }
}

export async function createVoucher(data: z.infer<typeof voucherSchema>) {
  try {
    const validatedData = voucherSchema.parse(data);

    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId: validatedData.travelId },
    });

    if (!itinerary) {
      throw new Error(`Itinerary with Itinerary ID ${validatedData.travelId} not found`);
    }

    const existingVouchersCount = await prisma.voucher.count({
      where: { itineraryTravelId: validatedData.travelId },
    });

    const voucherId = generateVoucherId(validatedData.travelId, existingVouchersCount);

    const voucher = await prisma.voucher.create({
      data: {
        voucherId,
        itineraryTravelId: validatedData.travelId,
        clientName: validatedData.clientName,
        adultNo: validatedData.adultNo,
        childrenNo: validatedData.childrenNo,
        totalNights: validatedData.totalNights,
        hotelStays: validatedData.hotelStays,
        cabDetails: validatedData.cabDetails,
      },
    });

    revalidatePath('/admin/voucher/voucher-list');

    return { success: true, voucherId: voucher.voucherId, id: voucher.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create voucher');
  }
}

export async function getAllVouchers() {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        itinerary: {
          select: {
            packageTitle: true,
            clientPhone: true,
            clientEmail: true,
            numberOfHotels: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vouchers.map((voucher) => ({
      ...voucher,
      travelId: voucher.itineraryTravelId, // ✅ Added for compatibility
      hotelStays: voucher.hotelStays as unknown as HotelStay[],
      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch vouchers');
  }
}

// ✅ Get voucher by database ID
export async function getVoucherById(id: string): Promise<VoucherData | null> {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return null;
    }

    return {
      id: voucher.id,
      voucherId: voucher.voucherId,
      travelId: voucher.itineraryTravelId, // ✅ Added for form compatibility
      itineraryTravelId: voucher.itineraryTravelId,
      clientName: voucher.clientName,
      adultNo: voucher.adultNo,
      childrenNo: voucher.childrenNo,
      totalNights: voucher.totalNights,
      hotelStays: voucher.hotelStays as unknown as HotelStay[],
      cabDetails: voucher.cabDetails,
      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch voucher');
  }
}

// ✅ NEW: Get voucher by voucher ID (TRLC... or TTHC...)
export async function getVoucherByVoucherId(voucherId: string): Promise<VoucherData | null> {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId },
    });

    if (!voucher) {
      return null;
    }

    return {
      id: voucher.id,
      voucherId: voucher.voucherId,
      travelId: voucher.itineraryTravelId,
      itineraryTravelId: voucher.itineraryTravelId,
      clientName: voucher.clientName,
      adultNo: voucher.adultNo,
      childrenNo: voucher.childrenNo,
      totalNights: voucher.totalNights,
      hotelStays: voucher.hotelStays as unknown as HotelStay[],
      cabDetails: voucher.cabDetails,
      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch voucher');
  }
}

export async function updateVoucher(id: string, data: z.infer<typeof voucherSchema>) {
  try {
    const validatedData = voucherSchema.parse(data);

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        clientName: validatedData.clientName,
        adultNo: validatedData.adultNo,
        childrenNo: validatedData.childrenNo,
        totalNights: validatedData.totalNights,
        hotelStays: validatedData.hotelStays,
        cabDetails: validatedData.cabDetails,
      },
    });

    revalidatePath('/admin/voucher/voucher-list');
    revalidatePath(`/admin/voucher/edit-voucher/${id}`);

    return { success: true, voucherId: voucher.voucherId, id: voucher.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update voucher');
  }
}

export async function deleteVoucher(id: string) {
  try {
    await prisma.voucher.delete({
      where: { id },
    });

    revalidatePath('/admin/voucher/voucher-list');

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete voucher');
  }
}

export async function getAllItinerariesForDropdown() {
  try {
    const itineraries = await prisma.itinerary.findMany({
      select: {
        travelId: true,
        clientName: true,
        packageTitle: true,
        clientPhone: true,
        clientEmail: true,
        numberOfHotels: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return itineraries;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch itineraries');
  }
}

export async function getItineraryForVoucher(travelId: string) {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId },
      select: {
        travelId: true,
        clientName: true,
        clientPhone: true,
        clientEmail: true,
        packageTitle: true,
        numberOfNights: true,
        numberOfHotels: true,
        hotels: true,
        cabs: true,
      },
    });

    if (!itinerary) {
      return null;
    }

    return itinerary;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch itinerary details');
  }
}

export async function getItineraryByTravelId(travelId: string) {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId },
    });

    if (!itinerary) {
      return null;
    }

    return {
      ...itinerary,
      days: itinerary.days as unknown as Array<{
        dayNumber: number;
        summary: string;
        imageSrc: string;
        description: string;
      }>,
      hotels: itinerary.hotels as unknown as Array<{
        placeName: string;
        placeDescription: string;
        hotelName: string;
        roomType: string;
        hotelDescription: string;
      }>,
      inclusions: itinerary.inclusions as string[],
      exclusions: itinerary.exclusions as string[],
      createdAt: itinerary.createdAt.toISOString(),
      updatedAt: itinerary.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw new Error('Failed to fetch itinerary');
  }
}
