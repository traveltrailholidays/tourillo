'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Generate unique travelId
function generateTravelId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TRV${timestamp}${random}`.toUpperCase();
}

// Itinerary validation schema
const itinerarySchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
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
  days: z.array(z.any()),
  hotels: z.array(z.any()),
  inclusions: z.array(z.any()),
  exclusions: z.array(z.any()),
});

// Create itinerary
export async function createItinerary(data: z.infer<typeof itinerarySchema>) {
  try {
    const validatedData = itinerarySchema.parse(data);
    const travelId = generateTravelId();

    const itinerary = await prisma.itinerary.create({
      data: {
        ...validatedData,
        travelId,
      },
    });

    revalidatePath('/admin/itinerary/itinerary-list');

    return { success: true, travelId: itinerary.travelId, id: itinerary.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create itinerary');
  }
}

// Get all itineraries
export async function getAllItineraries() {
  try {
    const itineraries = await prisma.itinerary.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return itineraries.map((itinerary) => ({
      ...itinerary,
      createdAt: itinerary.createdAt.toISOString(),
      updatedAt: itinerary.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch itineraries');
  }
}

// Get itinerary by travelId
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
      createdAt: itinerary.createdAt.toISOString(),
      updatedAt: itinerary.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch itinerary');
  }
}

// Delete itinerary
export async function deleteItinerary(id: string) {
  try {
    await prisma.itinerary.delete({
      where: { id },
    });

    revalidatePath('/admin/itinerary/itinerary-list');

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete itinerary');
  }
}
