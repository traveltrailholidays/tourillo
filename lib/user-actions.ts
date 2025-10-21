'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getUsersList() {
  await requireAdmin();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isAgent: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      // Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });

      // If deactivating, clear all sessions
      if (!isActive) {
        await tx.session.deleteMany({
          where: { userId },
        });
      }
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
}

export async function deleteUserAccount(userId: string) {
  await requireAdmin();

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function promoteToAdmin(userId: string) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: true,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
}
