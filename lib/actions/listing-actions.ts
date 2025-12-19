'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadBlogImage, deleteBlogImage } from './file-actions';
import { Listing } from '@prisma/client';
import { auth } from '@/auth';

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
    createdById: listing.createdById,
    updatedAt: listing.updatedAt ? listing.updatedAt.toISOString() : listing.createdAt.toISOString(),
  };
}

// ✅ Get current user with proper error handling
async function getCurrentUserId() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.error('❌ No session or user ID found');
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isActive: true,
        isAdmin: true,
        isAgent: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      console.error('❌ User not found in database:', session.user.id);
      return null;
    }

    if (!user.isActive) {
      console.error('❌ User account is deactivated:', user.email);
      return null;
    }

    console.log('✅ Current user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isAgent: user.isAgent,
    });

    return user.id;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
}

// ✅ Get current user details for verification
async function getCurrentUserDetails() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isAgent: true,
        isActive: true,
      },
    });

    return user;
  } catch (error) {
    console.error('❌ Error getting user details:', error);
    return null;
  }
}

// ✅ Find user by name and role (for bulk upload)
async function findUserByNameAndRole(name: string, role: string): Promise<string | null> {
  try {
    console.log('🔍 Searching for user:', { name, role });

    // Determine role flags
    const isAdmin = role.toLowerCase() === 'admin';
    const isAgent = role.toLowerCase() === 'agent';

    // Search by name or email with role match
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { email: { equals: name, mode: 'insensitive' } }],
        isActive: true,
        ...(isAdmin && { isAdmin: true }),
        ...(isAgent && { isAgent: true }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isAgent: true,
      },
    });

    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
      });
      return user.id;
    }

    console.log('⚠️ User not found for:', { name, role });
    return null;
  } catch (error) {
    console.error('❌ Error finding user:', error);
    return null;
  }
}

// ✅ Create listing with image upload and creator matching
export async function createListing(formData: FormData) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('You must be logged in to create a package. Please log in and try again.');
    }

    const user = await getCurrentUserDetails();
    if (!user) {
      throw new Error('User session invalid. Please log in again.');
    }

    console.log('📦 Creating package for user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.isAdmin ? 'Admin' : user.isAgent ? 'Agent' : 'User',
    });

    // Handle image upload or URL
    let imageSrc: string = '';
    const imageFile = formData.get('image') as File;
    const imageUrl = formData.get('imageSrc') as string;

    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }
      imageSrc = uploadResult.imagePath || '';
    } else if (imageUrl) {
      // Use provided URL (for bulk upload)
      imageSrc = imageUrl;
    }

    // Parse itinerary array
    const itinaryString = formData.get('itinary') as string;
    let itinary: string[] = [];

    try {
      itinary = JSON.parse(itinaryString || '[]');
    } catch {
      itinary = [];
    }

    // Get form values with null checks
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const location = formData.get('location');
    const price = formData.get('price');
    const days = formData.get('days');
    const nights = formData.get('nights');
    const rating = formData.get('rating');
    const discount = formData.get('discount');

    // Check if any required field is null
    if (!title || !description || !category || !location || !price || !days || !nights) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!description) missingFields.push('description');
      if (!category) missingFields.push('category');
      if (!location) missingFields.push('location');
      if (!price) missingFields.push('price');
      if (!days) missingFields.push('days');
      if (!nights) missingFields.push('nights');

      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}. This may be due to file size exceeding server limits.`
      );
    }

    // Validate listing data
    const rawData = {
      title: title as string,
      description: description as string,
      category: (category as string).toLowerCase(),
      location: location as string,
      price: Number(price),
      days: Number(days),
      nights: Number(nights),
      rating: rating ? Number(rating) : 0,
      discount: discount ? Number(discount) : 0,
      itinary,
    };

    const validatedData = listingSchema.parse(rawData);

    // ✅ Handle creator matching for bulk upload
    let createdById = userId;
    const creatorName = formData.get('creatorName') as string | null;
    const creatorRole = formData.get('creatorRole') as string | null;

    if (creatorName && creatorRole) {
      console.log('🔄 Bulk upload: Matching creator...', { creatorName, creatorRole });
      const matchedUserId = await findUserByNameAndRole(creatorName, creatorRole);

      if (matchedUserId) {
        createdById = matchedUserId;
        console.log('✅ Creator matched:', matchedUserId);
      } else {
        console.log('⚠️ Creator not found, using current user:', userId);
      }
    }

    // ✅ Create listing with creator ID
    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        imageSrc,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            isAgent: true,
          },
        },
      },
    });

    console.log('✅ Package created successfully:', {
      listingId: listing.id,
      title: listing.title,
      createdById: listing.createdById,
      creatorName: listing.createdBy?.name,
      creatorEmail: listing.createdBy?.email,
      creatorIsAdmin: listing.createdBy?.isAdmin,
      creatorIsAgent: listing.createdBy?.isAgent,
      role: listing.createdBy?.isAdmin ? 'Admin' : listing.createdBy?.isAgent ? 'Agent' : 'User',
    });

    revalidatePath('/admin/package/package-list');
    revalidatePath('/packages');

    return {
      success: true,
      listing,
    };
  } catch (error) {
    console.error('❌ Create listing error:', error);
    if (error instanceof z.ZodError) {
      throw new Error('Invalid form data: ' + formatZodError(error));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create listing');
  }
}

// ✅ Update listing with image upload
export async function updateListing(id: string, formData: FormData) {
  try {
    const validatedId = uuidSchema.parse(id);

    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('You must be logged in to update a package');
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id: validatedId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            isAgent: true,
          },
        },
      },
    });

    if (!existingListing) {
      throw new Error('Listing not found');
    }

    const currentUser = await getCurrentUserDetails();
    if (!currentUser?.isAdmin && !currentUser?.isAgent) {
      throw new Error('You do not have permission to edit this package');
    }

    let imageSrc: string = existingListing.imageSrc;
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('removeImage') === 'true';

    if (removeImage) {
      if (existingListing.imageSrc && existingListing.imageSrc.startsWith('/uploads/')) {
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

      if (existingListing.imageSrc && existingListing.imageSrc.startsWith('/uploads/')) {
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
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            isAgent: true,
          },
        },
      },
    });

    console.log('✅ Package updated successfully:', {
      id: updatedListing.id,
      title: updatedListing.title,
      updatedBy: currentUser?.name || currentUser?.email,
    });

    revalidatePath('/admin/package/package-list');
    revalidatePath(`/admin/package/edit/${validatedId}`);
    revalidatePath('/packages');

    return {
      success: true,
      listing: updatedListing,
    };
  } catch (error) {
    console.error('❌ Update listing error:', error);
    if (error instanceof z.ZodError) {
      throw new Error('Invalid form data: ' + formatZodError(error));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update listing');
  }
}

// ✅ Delete listing
export async function deleteListing(id: string) {
  try {
    const validatedId = uuidSchema.parse(id);

    const currentUser = await getCurrentUserDetails();
    if (!currentUser) {
      throw new Error('You must be logged in to delete a package');
    }

    if (!currentUser.isAdmin) {
      throw new Error('Only administrators can delete packages');
    }

    const listing = await prisma.listing.findUnique({
      where: { id: validatedId },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Only delete uploaded images (not external URLs)
    if (listing.imageSrc && listing.imageSrc.startsWith('/uploads/')) {
      await deleteBlogImage(listing.imageSrc);
    }

    await prisma.listing.delete({
      where: { id: validatedId },
    });

    console.log('✅ Package deleted by:', currentUser.name || currentUser.email);

    revalidatePath('/admin/package/package-list');
    revalidatePath('/packages');

    return { success: true };
  } catch (error) {
    console.error('❌ Delete listing error:', error);
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to delete listing');
  }
}

// ✅ Bulk delete listings (admin only)
export async function bulkDeleteListings(ids: string[]) {
  try {
    const currentUser = await getCurrentUserDetails();
    if (!currentUser?.isAdmin) {
      throw new Error('Only administrators can bulk delete packages');
    }

    // Validate all IDs
    const validatedIds = ids.map((id) => uuidSchema.parse(id));

    // Get all listings to delete their images
    const listings = await prisma.listing.findMany({
      where: { id: { in: validatedIds } },
      select: { id: true, imageSrc: true },
    });

    // Delete images
    for (const listing of listings) {
      if (listing.imageSrc && listing.imageSrc.startsWith('/uploads/')) {
        try {
          await deleteBlogImage(listing.imageSrc);
        } catch (error) {
          console.warn('Failed to delete image:', listing.imageSrc);
        }
      }
    }

    // Delete all listings
    const result = await prisma.listing.deleteMany({
      where: { id: { in: validatedIds } },
    });

    console.log('✅ Bulk deleted', result.count, 'packages');

    revalidatePath('/admin/package/package-list');
    revalidatePath('/packages');

    return { success: true, count: result.count };
  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to bulk delete listings');
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
    throw new Error('Failed to fetch listings');
  }
}

// ✅ Get all listings with creator info for table
export async function getAllListingsForTable() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            isAgent: true,
          },
        },
      },
    });

    const mappedListings = listings.map((listing) => {
      const creatorInfo = listing.createdBy
        ? {
            id: listing.createdBy.id,
            name: listing.createdBy.name,
            email: listing.createdBy.email,
            role: listing.createdBy.isAdmin ? 'Admin' : listing.createdBy.isAgent ? 'Agent' : 'User',
          }
        : null;

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
        updatedAt: listing.updatedAt ? listing.updatedAt.toISOString() : listing.createdAt.toISOString(),
        createdById: listing.createdById,
        creator: creatorInfo,
      };
    });

    return mappedListings;
  } catch (error) {
    console.error('❌ Error fetching listings for table:', error);
    throw new Error('Failed to fetch listings for table');
  }
}

// Get single listing by ID
export async function getListingById(id: string) {
  try {
    const validatedId = uuidSchema.parse(id);

    return await prisma.listing.findUnique({
      where: { id: validatedId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            isAgent: true,
          },
        },
      },
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
    throw new Error('Failed to fetch public listings');
  }
}

// Search listings by query
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
    throw new Error('Failed to search listings');
  }
}

// Get featured listings
export async function getFeaturedListings() {
  try {
    const totalCount = await prisma.listing.count({
      where: {
        OR: [{ category: 'featured' }],
      },
    });

    const listings = await prisma.listing.findMany({
      where: {
        OR: [{ category: 'featured' }],
      },
      orderBy: {
        rating: 'desc',
      },
      take: 8,
    });

    return {
      listings: listings.map(toSafeListing),
      totalCount,
    };
  } catch (error) {
    throw new Error('Failed to fetch featured listings');
  }
}

// Get weekend listings
export async function getWeekendListings() {
  try {
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
      take: 8,
    });

    return {
      listings: listings.map(toSafeListing),
      totalCount,
    };
  } catch (error) {
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
    throw new Error('Failed to fetch categories');
  }
}

// ✅ Get listing statistics
export async function getListingStats() {
  try {
    const currentUser = await getCurrentUserDetails();
    if (!currentUser?.isAdmin && !currentUser?.isAgent) {
      throw new Error('Unauthorized');
    }

    const [total, withDiscount, byCategory, byCreator] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { discount: { gt: 0 } } }),
      prisma.listing.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.listing.groupBy({
        by: ['createdById'],
        _count: true,
        where: { createdById: { not: null } },
      }),
    ]);

    const avgRating = await prisma.listing.aggregate({
      _avg: { rating: true },
    });

    return {
      total,
      withDiscount,
      avgRating: avgRating._avg.rating || 0,
      byCategory: byCategory.map((cat) => ({
        category: cat.category,
        count: cat._count,
      })),
      byCreator: byCreator.map((creator) => ({
        createdById: creator.createdById,
        count: creator._count,
      })),
    };
  } catch (error) {
    throw new Error('Failed to fetch listing statistics');
  }
}
