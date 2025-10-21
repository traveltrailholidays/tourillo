'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addToWishlist(listingId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistId: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const updatedWishlist = [...new Set([...user.wishlistId, listingId])];

    await prisma.user.update({
      where: { id: session.user.id },
      data: { wishlistId: updatedWishlist },
    });

    revalidatePath('/wishlist');
    return { success: true, wishlistId: updatedWishlist };
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return { success: false, error: 'Failed to add to wishlist' };
  }
}

export async function removeFromWishlist(listingId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistId: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const updatedWishlist = user.wishlistId.filter((id) => id !== listingId);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { wishlistId: updatedWishlist },
    });

    revalidatePath('/wishlist');
    return { success: true, wishlistId: updatedWishlist };
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return { success: false, error: 'Failed to remove from wishlist' };
  }
}

export async function getWishlist() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated', wishlist: [] };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistId: true },
    });

    if (!user) {
      return { success: false, error: 'User not found', wishlist: [] };
    }

    return { success: true, wishlistId: user.wishlistId };
  } catch (error) {
    console.error('Get wishlist error:', error);
    return { success: false, error: 'Failed to get wishlist', wishlist: [] };
  }
}
