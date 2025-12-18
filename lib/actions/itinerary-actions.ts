'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadItineraryImage } from './file-actions';

// Generate unique travelId based on company
function generateTravelId(company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS'): string {
  const prefix = company === 'TOURILLO' ? 'TRL' : 'TTH';
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `${prefix}${day}${month}${year}${hours}${minutes}${randomNum}`;
}

// Check if travelId is unique, if not, regenerate
async function generateUniqueTravelId(company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS'): Promise<string> {
  let travelId = generateTravelId(company);
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
    travelId = generateTravelId(company);
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
  company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS';
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

// Itinerary validation schema - ✅ UPDATED: numberOfHotels now allows 0
const itinerarySchema = z.object({
  travelId: z.string().min(1, 'Travel ID is required'),
  company: z.enum(['TOURILLO', 'TRAVEL_TRAIL_HOLIDAYS']),
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  packageTitle: z.string().min(1, 'Package title is required'),
  numberOfDays: z.number().min(1, 'At least 1 day is required'),
  numberOfNights: z.number().min(0, 'Nights cannot be negative'),
  numberOfHotels: z.number().min(0, 'Hotels cannot be negative'), // ✅ Changed from min(1) to min(0)
  tripAdvisorName: z.string().min(1, 'Trip advisor name is required'),
  tripAdvisorNumber: z.string().min(1, 'Trip advisor number is required'),
  cabs: z.string().min(1, 'Cab details required'),
  flights: z.string().min(1, 'Flight details required'),
  quotePrice: z.number().min(0, 'Quote price cannot be negative'),
  pricePerPerson: z.number().min(0, 'Price per person cannot be negative'),
  days: z.array(z.any()),
  hotels: z.array(z.any()),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
});

// Generate new Travel ID
export async function generateNewTravelId(company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS' = 'TOURILLO'): Promise<string> {
  return await generateUniqueTravelId(company);
}

// Check phone number exists
export async function checkPhoneNumberExists(phoneNumber: string, excludeTravelId?: string) {
  try {
    const existingItinerary = await prisma.itinerary.findFirst({
      where: {
        clientPhone: phoneNumber,
        ...(excludeTravelId && { travelId: { not: excludeTravelId } }),
      },
      select: {
        travelId: true,
        clientName: true,
        packageTitle: true,
        company: true,
      },
    });

    if (existingItinerary) {
      return {
        exists: true,
        itinerary: existingItinerary,
      };
    }

    return { exists: false, itinerary: null };
  } catch (error) {
    console.error('Error checking phone number:', error);
    return { exists: false, itinerary: null };
  }
}

// Create itinerary with FormData (handles image upload)
export async function createItinerary(formData: FormData) {
  try {
    const dayImages: { [key: number]: string } = {};
    const numberOfDays = parseInt(formData.get('numberOfDays') as string);

    // Upload all day images using uploadItineraryImage
    for (let i = 0; i < numberOfDays; i++) {
      const imageFile = formData.get(`dayImage_${i}`) as File;

      if (imageFile && imageFile.size > 0) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const uploadResult = await uploadItineraryImage(imageFormData);
        if (uploadResult.success && uploadResult.imagePath) {
          dayImages[i] = uploadResult.imagePath;
        }
      }
    }

    // Parse days data
    const days: DayData[] = [];
    for (let i = 0; i < numberOfDays; i++) {
      days.push({
        dayNumber: i + 1,
        summary: formData.get(`days[${i}][summary]`) as string,
        imageSrc: dayImages[i] || (formData.get(`days[${i}][imageSrc]`) as string) || '',
        description: formData.get(`days[${i}][description]`) as string,
      });
    }

    // Parse hotels data - ✅ Now handles 0 hotels gracefully
    const numberOfHotels = parseInt(formData.get('numberOfHotels') as string);
    const hotels: HotelData[] = [];

    // If numberOfHotels is 0, this loop won't execute - hotels array remains empty
    for (let i = 0; i < numberOfHotels; i++) {
      hotels.push({
        placeName: formData.get(`hotels[${i}][placeName]`) as string,
        placeDescription: formData.get(`hotels[${i}][placeDescription]`) as string,
        hotelName: formData.get(`hotels[${i}][hotelName]`) as string,
        roomType: formData.get(`hotels[${i}][roomType]`) as string,
        hotelDescription: formData.get(`hotels[${i}][hotelDescription]`) as string,
      });
    }

    // Parse inclusions and exclusions
    const inclusions = JSON.parse((formData.get('inclusions') as string) || '[]');
    const exclusions = JSON.parse((formData.get('exclusions') as string) || '[]');

    // Build final data object
    const rawData = {
      travelId: formData.get('travelId') as string,
      company: formData.get('company') as 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS',
      clientName: formData.get('clientName') as string,
      clientPhone: formData.get('clientPhone') as string,
      clientEmail: (formData.get('clientEmail') as string) || '',
      packageTitle: formData.get('packageTitle') as string,
      numberOfDays: parseInt(formData.get('numberOfDays') as string),
      numberOfNights: parseInt(formData.get('numberOfNights') as string),
      numberOfHotels: parseInt(formData.get('numberOfHotels') as string),
      tripAdvisorName: formData.get('tripAdvisorName') as string,
      tripAdvisorNumber: formData.get('tripAdvisorNumber') as string,
      cabs: formData.get('cabs') as string,
      flights: formData.get('flights') as string,
      quotePrice: parseFloat(formData.get('quotePrice') as string),
      pricePerPerson: parseFloat(formData.get('pricePerPerson') as string),
      days,
      hotels,
      inclusions,
      exclusions,
    };

    const validatedData = itinerarySchema.parse(rawData);

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

// Update itinerary with FormData (handles image upload)
export async function updateItineraryWithFormData(travelId: string, formData: FormData) {
  try {
    const dayImages: { [key: number]: string } = {};
    const numberOfDays = parseInt(formData.get('numberOfDays') as string);

    // Upload all new day images
    for (let i = 0; i < numberOfDays; i++) {
      const imageFile = formData.get(`dayImage_${i}`) as File;

      if (imageFile && imageFile.size > 0) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const uploadResult = await uploadItineraryImage(imageFormData);
        if (uploadResult.success && uploadResult.imagePath) {
          dayImages[i] = uploadResult.imagePath;
        }
      }
    }

    // Parse days data
    const days: DayData[] = [];
    for (let i = 0; i < numberOfDays; i++) {
      days.push({
        dayNumber: i + 1,
        summary: formData.get(`days[${i}][summary]`) as string,
        imageSrc: dayImages[i] || (formData.get(`days[${i}][imageSrc]`) as string) || '',
        description: formData.get(`days[${i}][description]`) as string,
      });
    }

    // Parse hotels data - ✅ Now handles 0 hotels gracefully
    const numberOfHotels = parseInt(formData.get('numberOfHotels') as string);
    const hotels: HotelData[] = [];

    // If numberOfHotels is 0, this loop won't execute - hotels array remains empty
    for (let i = 0; i < numberOfHotels; i++) {
      hotels.push({
        placeName: formData.get(`hotels[${i}][placeName]`) as string,
        placeDescription: formData.get(`hotels[${i}][placeDescription]`) as string,
        hotelName: formData.get(`hotels[${i}][hotelName]`) as string,
        roomType: formData.get(`hotels[${i}][roomType]`) as string,
        hotelDescription: formData.get(`hotels[${i}][hotelDescription]`) as string,
      });
    }

    // Parse inclusions and exclusions
    const inclusions = JSON.parse((formData.get('inclusions') as string) || '[]');
    const exclusions = JSON.parse((formData.get('exclusions') as string) || '[]');

    // Build final data object
    const rawData = {
      travelId: formData.get('travelId') as string,
      company: formData.get('company') as 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS',
      clientName: formData.get('clientName') as string,
      clientPhone: formData.get('clientPhone') as string,
      clientEmail: (formData.get('clientEmail') as string) || '',
      packageTitle: formData.get('packageTitle') as string,
      numberOfDays: parseInt(formData.get('numberOfDays') as string),
      numberOfNights: parseInt(formData.get('numberOfNights') as string),
      numberOfHotels: parseInt(formData.get('numberOfHotels') as string),
      tripAdvisorName: formData.get('tripAdvisorName') as string,
      tripAdvisorNumber: formData.get('tripAdvisorNumber') as string,
      cabs: formData.get('cabs') as string,
      flights: formData.get('flights') as string,
      quotePrice: parseFloat(formData.get('quotePrice') as string),
      pricePerPerson: parseFloat(formData.get('pricePerPerson') as string),
      days,
      hotels,
      inclusions,
      exclusions,
    };

    const validatedData = itinerarySchema.parse(rawData);

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

// Get itinerary by travelId
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
      company: itinerary.company as 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS',
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

// Get all itineraries for clone (with phone number for search)
export async function getAllItinerariesForClone() {
  try {
    const itineraries = await prisma.itinerary.findMany({
      select: {
        travelId: true,
        company: true,
        clientName: true,
        clientPhone: true,
        packageTitle: true,
        numberOfDays: true,
        numberOfNights: true,
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

// Get complete itinerary data for cloning
export async function getItineraryForClone(travelId: string) {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { travelId },
    });

    if (!itinerary) {
      return null;
    }

    // Return all data except id and timestamps
    return {
      company: itinerary.company as 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS',
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
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch itinerary for cloning');
  }
}
