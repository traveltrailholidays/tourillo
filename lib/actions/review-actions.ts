'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadBlogImage, deleteBlogImage } from './file-actions';

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid UUID format');

// Review validation schema
const reviewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  rating: z.number().min(1).max(5),
  reviewDate: z.string().min(1, 'Review date is required'),
});

// Type definitions
interface ActionState {
  error: Record<string, { _errors: string[] }> | null;
  message: string;
  success: boolean;
  reviewId?: string;
}

// Helper functions
function validateUUID(id: string): string {
  return uuidSchema.parse(id);
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

// Create review with state (for useActionState) - PUBLIC
export async function createReviewWithState(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // Handle image upload first
    let imagePath = '/images/avatar.webp'; // Default avatar
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }
      imagePath = uploadResult.imagePath || '/images/avatar.webp';
    }

    // Validate review data
    const rawData = {
      name: formData.get('name') as string,
      review: formData.get('review') as string,
      rating: parseInt(formData.get('rating') as string),
      reviewDate: formData.get('reviewDate') as string,
    };

    const validatedData = reviewSchema.parse(rawData);

    const review = await prisma.review.create({
      data: {
        ...validatedData,
        image: imagePath,
        isDisplay: false, // Admin approval required
        isRead: false,
      },
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/');

    return {
      error: null,
      message: 'Review submitted successfully! It will be displayed after admin approval.',
      success: true,
      reviewId: review.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: null,
        message: 'Invalid form data: ' + formatZodError(error),
        success: false,
      };
    }
    return {
      error: null,
      message: error instanceof Error ? error.message : 'Failed to submit review',
      success: false,
    };
  }
}

// Update review with state (for useActionState) - ADMIN ONLY
export async function updateReviewWithState(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const reviewId = formData.get('reviewId') as string;
    const validatedId = validateUUID(reviewId);

    const existingReview = await prisma.review.findUnique({
      where: { id: validatedId },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    let imagePath = existingReview.image;
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('removeImage') === 'true';

    if (removeImage) {
      // Delete old image only if it's not the default avatar
      if (existingReview.image && existingReview.image !== '/images/avatar.webp') {
        await deleteBlogImage(existingReview.image);
      }
      imagePath = '/images/avatar.webp';
    } else if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }

      // Delete old image only if it's not the default avatar
      if (existingReview.image && existingReview.image !== '/images/avatar.webp') {
        await deleteBlogImage(existingReview.image);
      }

      imagePath = uploadResult.imagePath || '/images/avatar.webp';
    }

    const rawData = {
      name: formData.get('name') as string,
      review: formData.get('review') as string,
      rating: parseInt(formData.get('rating') as string),
      reviewDate: formData.get('reviewDate') as string,
    };

    const validatedData = reviewSchema.parse(rawData);

    await prisma.review.update({
      where: { id: validatedId },
      data: {
        ...validatedData,
        image: imagePath,
      },
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/');

    return {
      error: null,
      message: 'Review updated successfully!',
      success: true,
      reviewId: validatedId,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: null,
        message: 'Invalid form data: ' + formatZodError(error),
        success: false,
        reviewId: prevState.reviewId,
      };
    }
    return {
      error: null,
      message: error instanceof Error ? error.message : 'Failed to update review',
      success: false,
      reviewId: prevState.reviewId,
    };
  }
}

// Delete review - ADMIN ONLY (client-side me admin check karna)
export async function deleteReview(id: string): Promise<void> {
  try {
    const validatedId = validateUUID(id);

    const review = await prisma.review.findUnique({
      where: { id: validatedId },
    });

    // Delete image only if it's not the default avatar
    if (review?.image && review.image !== '/images/avatar.webp') {
      await deleteBlogImage(review.image);
    }

    await prisma.review.delete({
      where: { id: validatedId },
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error('Failed to delete review');
  }
}

// Get all reviews for table - ADMIN PAGE
export async function getAllReviewsForTable() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw new Error('Failed to fetch reviews');
  }
}

// Get displayed reviews - PUBLIC
export async function getDisplayedReviews() {
  try {
    return await prisma.review.findMany({
      where: {
        isDisplay: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching displayed reviews:', error);
    throw new Error('Failed to fetch displayed reviews');
  }
}

// Toggle review display - ADMIN ONLY (client-side me admin check karna)
export async function toggleReviewDisplay(id: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error('Review not found');

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isDisplay: !review.isDisplay,
      },
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error toggling review display:', error);
    throw new Error('Failed to toggle review display');
  }
}

// Toggle review read status - ADMIN ONLY (client-side me admin check karna)
export async function toggleReviewRead(id: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error('Review not found');

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isRead: !review.isRead,
      },
    });

    revalidatePath('/admin/reviews');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error toggling review read status:', error);
    throw new Error('Failed to toggle review read status');
  }
}

// Get review by ID - ADMIN ONLY
export async function getReviewById(id: string) {
  try {
    const validatedId = validateUUID(id);

    return await prisma.review.findUnique({
      where: { id: validatedId },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error('Failed to fetch review');
  }
}
