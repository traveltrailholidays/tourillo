import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getValidSession = cache(async () => {
  const session = await auth();

  if (!session?.user || session.error) {
    return null;
  }

  return session;
});

export async function requireAuth() {
  const session = await getValidSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (!session.user.isAdmin) {
    redirect('/');
  }

  return session;
}

// Utility to invalidate all sessions for a user
export async function invalidateUserSessions(userId: string) {
  try {
    const deletedSessions = await prisma.session.deleteMany({
      where: { userId },
    });

    // console.log(`Invalidated ${deletedSessions.count} sessions for user: ${userId}`);
    return deletedSessions.count;
  } catch (error) {
    console.error(`Failed to invalidate sessions for user ${userId}:`, error);
    throw error;
  }
}

// Utility to deactivate user and invalidate sessions
export async function deactivateUser(userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // First deactivate the user
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      // Then invalidate all sessions
      await tx.session.deleteMany({
        where: { userId },
      });
    });

    // console.log(`User ${userId} deactivated and sessions cleared`);
  } catch (error) {
    console.error(`Failed to deactivate user ${userId}:`, error);
    throw error;
  }
}

// Utility to completely delete a user
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    // console.log(`User ${userId} deleted successfully`);
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
}

// Utility to reactivate a user
export async function reactivateUser(userId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // console.log(`User ${userId} reactivated successfully`);
    return user;
  } catch (error) {
    console.error(`Failed to reactivate user ${userId}:`, error);
    throw error;
  }
}
