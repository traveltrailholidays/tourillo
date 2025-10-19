'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';

// User validation schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.email('Invalid email').optional(),
  isAdmin: z.boolean().optional(),
  isAgent: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Get all users (non-admin, non-agent)
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false,
        isAgent: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch users');
  }
}

// Get all agents
export async function getAllAgents() {
  try {
    const agents = await prisma.user.findMany({
      where: {
        isAgent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return agents.map((agent) => ({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      lastLoginAt: agent.lastLoginAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch agents');
  }
}

// Get all admins
export async function getAllAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        isAdmin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return admins.map((admin) => ({
      ...admin,
      createdAt: admin.createdAt.toISOString(),
      lastLoginAt: admin.lastLoginAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch admins');
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user');
  }
}

// Update user
export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      throw new Error('Unauthorized');
    }

    const validatedData = userSchema.parse(data);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/admin/users-list');
    revalidatePath('/admin/agents-list');
    revalidatePath('/admin/admins-list');

    return { success: true, user: updatedUser };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Changed from error.errors to error.issues
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update user');
  }
}

// Soft delete user (deactivate)
export async function deactivateUser(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      throw new Error('Unauthorized');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    revalidatePath('/admin/users-list');
    revalidatePath('/admin/agents-list');
    revalidatePath('/admin/admins-list');

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to deactivate user');
  }
}

// Hard delete user (permanent)
export async function deleteUserPermanently(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      throw new Error('Unauthorized');
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      throw new Error('Cannot delete your own account');
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users-list');
    revalidatePath('/admin/agents-list');
    revalidatePath('/admin/admins-list');

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
  }
}

// Reactivate user
export async function reactivateUser(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      throw new Error('Unauthorized');
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    revalidatePath('/admin/users-list');
    revalidatePath('/admin/agents-list');
    revalidatePath('/admin/admins-list');

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reactivate user');
  }
}
