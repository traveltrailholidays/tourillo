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
  travelId: string;
  clientName: string;
  adultNo: number;
  childrenNo: number;
  totalNights: number;
  hotelStays: HotelStay[];
  cabDetails: string;
  createdAt: string;
  updatedAt: string;
}

const voucherSchema = z.object({
  travelId: z.string().min(1, 'Travel ID is required'),
  clientName: z.string().min(1, 'Client name is required'),
  adultNo: z.number().min(1, 'At least 1 adult is required'),
  childrenNo: z.number().min(0),
  totalNights: z.number().min(0, 'Nights cannot be negative'),
  hotelStays: z.array(z.any()),
  cabDetails: z.string().min(1, 'Cab details are required'),
});

export async function createVoucher(data: z.infer<typeof voucherSchema>) {
  try {
    const validatedData = voucherSchema.parse(data);

    // Check if itinerary exists
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId: validatedData.travelId },
    });

    if (!itinerary) {
      throw new Error(`Itinerary with Travel ID ${validatedData.travelId} not found`);
    }

    // Check if voucher already exists for this travelId
    const existingVoucher = await prisma.voucher.findUnique({
      where: { travelId: validatedData.travelId },
    });

    if (existingVoucher) {
      throw new Error(`Voucher already exists for Travel ID ${validatedData.travelId}`);
    }

    const voucher = await prisma.voucher.create({
      data: validatedData,
    });

    revalidatePath('/admin/voucher/voucher-list');

    return { success: true, travelId: voucher.travelId, id: voucher.id };
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vouchers.map((voucher) => ({
      ...voucher,
      hotelStays: voucher.hotelStays as unknown as HotelStay[],
      createdAt: voucher.createdAt.toISOString(),
      updatedAt: voucher.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch vouchers');
  }
}

export async function getVoucherByTravelId(travelId: string): Promise<VoucherData | null> {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { travelId },
    });

    if (!voucher) {
      return null;
    }

    return {
      id: voucher.id,
      travelId: voucher.travelId,
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

export async function updateVoucher(travelId: string, data: z.infer<typeof voucherSchema>) {
  try {
    const validatedData = voucherSchema.parse(data);

    const voucher = await prisma.voucher.update({
      where: { travelId },
      data: validatedData,
    });

    revalidatePath('/admin/voucher/voucher-list');
    revalidatePath(`/admin/voucher/edit-voucher/${travelId}`);

    return { success: true, travelId: voucher.travelId, id: voucher.id };
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
