'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadBlogImage, deleteBlogImage } from './file-actions';
import { Listing } from '@prisma/client';

// Listing validation schema
const listingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  price: z.number().min(1, 'Price must be at least 1'),
  days: z.number().min(1, 'Days must be at least 1'),
  nights: z.number().min(0, 'Nights cannot be negative'),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
  discount: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
  itinary: z.array(z.string().min(1, 'Itinerary item cannot be empty')),
});

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid UUID format');

// Helper function to format Zod errors
function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

// Helper function to convert Listing to SafeListing
function toSafeListing(listing: Listing) {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    imageSrc: listing.imageSrc,
    category: listing.category,
    price: listing.price,
    location: listing.location,
    days: listing.days,
    nights: listing.nights,
    rating: listing.rating,
    discount: listing.discount,
    itinary: listing.itinary,
    createdAt: listing.createdAt.toISOString(),
  };
}

// Create listing with image upload
export async function createListing(formData: FormData) {
  try {
    // Handle image upload first
    let imageSrc: string = '';
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }
      imageSrc = uploadResult.imagePath || '';
    }

    // Parse itinerary array
    const itinaryString = formData.get('itinary') as string;
    let itinary: string[] = [];

    try {
      itinary = JSON.parse(itinaryString);
    } catch {
      itinary = [];
    }

    // Validate listing data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: (formData.get('category') as string).toLowerCase(),
      location: formData.get('location') as string,
      price: Number(formData.get('price')),
      days: Number(formData.get('days')),
      nights: Number(formData.get('nights')),
      rating: Number(formData.get('rating')),
      discount: Number(formData.get('discount')),
      itinary,
    };

    const validatedData = listingSchema.parse(rawData);

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        imageSrc,
      },
    });

    revalidatePath('/admin/package/package-list');
    revalidatePath('/packages');

    return {
      success: true,
      listing,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid form data: ' + formatZodError(error));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create listing');
  }
}

// Update listing with image upload
export async function updateListing(id: string, formData: FormData) {
  try {
    const validatedId = uuidSchema.parse(id);

    const existingListing = await prisma.listing.findUnique({
      where: { id: validatedId },
    });

    if (!existingListing) {
      throw new Error('Listing not found');
    }

    let imageSrc: string = existingListing.imageSrc;
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('removeImage') === 'true';

    if (removeImage) {
      if (existingListing.imageSrc) {
        await deleteBlogImage(existingListing.imageSrc);
      }
      imageSrc = '';
    } else if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }

      if (existingListing.imageSrc) {
        await deleteBlogImage(existingListing.imageSrc);
      }

      imageSrc = uploadResult.imagePath || '';
    }

    const itinaryString = formData.get('itinary') as string;
    let itinary: string[] = [];

    try {
      itinary = JSON.parse(itinaryString);
    } catch {
      itinary = existingListing.itinary;
    }

    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: (formData.get('category') as string).toLowerCase(),
      location: formData.get('location') as string,
      price: Number(formData.get('price')),
      days: Number(formData.get('days')),
      nights: Number(formData.get('nights')),
      rating: Number(formData.get('rating')),
      discount: Number(formData.get('discount')),
      itinary,
    };

    const validatedData = listingSchema.parse(rawData);

    const updatedListing = await prisma.listing.update({
      where: { id: validatedId },
      data: {
        ...validatedData,
        imageSrc,
      },
    });

    revalidatePath('/admin/package/package-list');
    revalidatePath(`/admin/package/edit/${validatedId}`);
    revalidatePath('/packages');

    return {
      success: true,
      listing: updatedListing,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid form data: ' + formatZodError(error));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update listing');
  }
}

// Delete listing
// This is already in your code - just confirming it's correct
export async function deleteListing(id: string) {
  try {
    const validatedId = uuidSchema.parse(id);

    const listing = await prisma.listing.findUnique({
      where: { id: validatedId },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Delete image from storage
    if (listing.imageSrc) {
      await deleteBlogImage(listing.imageSrc);
    }

    // Delete listing from database
    await prisma.listing.delete({
      where: { id: validatedId },
    });

    revalidatePath('/admin/package/package-list');
    revalidatePath('/packages');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to delete listing');
  }
}

// Get all listings (admin)
export async function getAllListings() {
  try {
    return await prisma.listing.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch listings');
  }
}

// Get all listings for table (admin)
export async function getAllListingsForTable() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch listings for table');
  }
}

// Get single listing by ID
export async function getListingById(id: string) {
  try {
    const validatedId = uuidSchema.parse(id);

    return await prisma.listing.findUnique({
      where: { id: validatedId },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error('Failed to fetch listing');
  }
}

// Get public listings with optional category filter
export async function getPublicListings(category?: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: category ? { category: category.toLowerCase() } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });

    return listings.map(toSafeListing);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch public listings');
  }
}

// Search listings by query (searches in title, description, location, category)
export async function searchListings(query: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return listings.map(toSafeListing);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to search listings');
  }
}

// Get featured listings
export async function getFeaturedListings() {
  try {
    // Get total count
    const totalCount = await prisma.listing.count({
      where: {
        OR: [{ category: 'featured' }],
      },
    });

    // Get listings
    const listings = await prisma.listing.findMany({
      where: {
        OR: [{ category: 'featured' }],
      },
      orderBy: {
        rating: 'desc',
      },
      take: 8, // Limit to 8 featured packages
    });

    return {
      listings: listings.map(toSafeListing),
      totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch featured listings');
  }
}


// Get weekend listings (category = 'weekend' and days <= 3)
export async function getWeekendListings() {
  try {
    // Get total count
    const totalCount = await prisma.listing.count({
      where: {
        OR: [
          { category: 'weekend' },
          {
            AND: [{ days: { lte: 3 } }, { nights: { lte: 2 } }],
          },
        ],
      },
    });

    // Get listings
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { category: 'weekend' },
          {
            AND: [{ days: { lte: 3 } }, { nights: { lte: 2 } }],
          },
        ],
      },
      orderBy: {
        rating: 'desc',
      },
      take: 8, // Limit to 8 weekend packages
    });

    return {
      listings: listings.map(toSafeListing),
      totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch weekend listings');
  }
}


// Get discounted listings
export async function getDiscountedListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        discount: {
          gt: 0,
        },
      },
      orderBy: {
        discount: 'desc',
      },
      take: 8,
    });

    return listings.map(toSafeListing);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch discounted listings');
  }
}

// Get all unique categories
export async function getCategories() {
  try {
    const categories = await prisma.listing.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return categories.map((cat) => cat.category);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch categories');
  }
}
