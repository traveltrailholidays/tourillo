'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Generate unique travelId in format: TRL2411202516110001
function generateTravelId(): string {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `TRL${day}${month}${year}${hours}${minutes}${randomNum}`;
}

// Check if travelId is unique, if not, regenerate
async function generateUniqueTravelId(): Promise<string> {
  let travelId = generateTravelId();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await prisma.itinerary.findUnique({
      where: { travelId },
    });

    if (!existing) {
      return travelId;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    travelId = generateTravelId();
    attempts++;
  }

  throw new Error('Failed to generate unique travel ID');
}

// Type definitions for structured data
export interface DayData {
  dayNumber: number;
  summary: string;
  imageSrc: string;
  description: string;
}

export interface HotelData {
  placeName: string;
  placeDescription: string;
  hotelName: string;
  roomType: string;
  hotelDescription: string;
}

export interface ItineraryData {
  id: string;
  travelId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  packageTitle: string;
  numberOfDays: number;
  numberOfNights: number;
  numberOfHotels: number;
  tripAdvisorName: string;
  tripAdvisorNumber: string;
  cabs: string;
  flights: string;
  quotePrice: number;
  pricePerPerson: number;
  days: DayData[];
  hotels: HotelData[];
  inclusions: string[];
  exclusions: string[];
  createdAt: string;
  updatedAt: string;
}

// Itinerary validation schema
const itinerarySchema = z.object({
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
  days: z.array(z.any()),
  hotels: z.array(z.any()),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
});

// Create itinerary
export async function createItinerary(data: z.infer<typeof itinerarySchema>) {
  try {
    const validatedData = itinerarySchema.parse(data);

    // Check if custom travelId already exists
    const existingTravelId = await prisma.itinerary.findUnique({
      where: { travelId: validatedData.travelId },
    });

    if (existingTravelId) {
      throw new Error(`Travel ID ${validatedData.travelId} already exists. Please use a different ID.`);
    }

    // Convert empty email to null
    const cleanedData = {
      ...validatedData,
      clientEmail:
        validatedData.clientEmail && validatedData.clientEmail.trim() !== '' ? validatedData.clientEmail : null,
    };

    const itinerary = await prisma.itinerary.create({
      data: cleanedData,
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

// Generate new Travel ID
export async function generateNewTravelId(): Promise<string> {
  return await generateUniqueTravelId();
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
      days: itinerary.days as unknown as DayData[],
      hotels: itinerary.hotels as unknown as HotelData[],
      inclusions: itinerary.inclusions as unknown as string[],
      exclusions: itinerary.exclusions as unknown as string[],
      createdAt: itinerary.createdAt.toISOString(),
      updatedAt: itinerary.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch itineraries');
  }
}

// Get itinerary by travelId - WITH PROPER TYPING
export async function getItineraryByTravelId(travelId: string): Promise<ItineraryData | null> {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId },
    });

    if (!itinerary) {
      return null;
    }

    return {
      id: itinerary.id,
      travelId: itinerary.travelId,
      clientName: itinerary.clientName,
      clientPhone: itinerary.clientPhone,
      clientEmail: itinerary.clientEmail,
      packageTitle: itinerary.packageTitle,
      numberOfDays: itinerary.numberOfDays,
      numberOfNights: itinerary.numberOfNights,
      numberOfHotels: itinerary.numberOfHotels,
      tripAdvisorName: itinerary.tripAdvisorName,
      tripAdvisorNumber: itinerary.tripAdvisorNumber,
      cabs: itinerary.cabs,
      flights: itinerary.flights,
      quotePrice: itinerary.quotePrice,
      pricePerPerson: itinerary.pricePerPerson,
      days: itinerary.days as unknown as DayData[],
      hotels: itinerary.hotels as unknown as HotelData[],
      inclusions: itinerary.inclusions as unknown as string[],
      exclusions: itinerary.exclusions as unknown as string[],
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

// Check if travelId exists
export async function checkTravelIdExists(travelId: string): Promise<boolean> {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId },
      select: { id: true },
    });
    return !!itinerary;
  } catch (error) {
    return false;
  }
}

// Update itinerary
export async function updateItinerary(travelId: string, data: z.infer<typeof itinerarySchema>) {
  try {
    const validatedData = itinerarySchema.parse(data);

    // Convert empty email to null
    const cleanedData = {
      ...validatedData,
      clientEmail:
        validatedData.clientEmail && validatedData.clientEmail.trim() !== '' ? validatedData.clientEmail : null,
    };

    const itinerary = await prisma.itinerary.update({
      where: { travelId },
      data: cleanedData,
    });

    revalidatePath('/admin/itinerary/itinerary-list');
    revalidatePath(`/admin/itinerary/edit-itinerary/${travelId}`);
    revalidatePath(`/itinerary/view/${travelId}`);

    return { success: true, travelId: itinerary.travelId, id: itinerary.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update itinerary');
  }
}
