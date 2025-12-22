'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';

// User validation schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.email('Invalid email').optional(),
  phone: z.string().optional().nullable(),
  isAdmin: z.boolean().optional(),
  isAgent: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ✅ Get all users with accounts AND password field
export async function getAllUsersWithAccounts() {
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
        emailVerified: true,
        phone: true,
        image: true,
        password: true, // ✅ Included
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        wishlistId: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            type: true,
            providerAccountId: true,
            createdAt: true,
          },
        },
      },
    });

    return users.map((user) => ({
      ...user,
      password: user.password || null, // ✅ Ensure it's always null if undefined
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      emailVerified: user.emailVerified?.toISOString() || null,
      accounts: user.accounts.map((acc) => ({
        ...acc,
        createdAt: acc.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch users with accounts');
  }
}

// ✅ Get all agents with accounts AND password field
export async function getAllAgentsWithAccounts() {
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
        emailVerified: true,
        phone: true,
        image: true,
        password: true, // ✅ Included
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            type: true,
            providerAccountId: true,
            createdAt: true,
          },
        },
      },
    });

    return agents.map((agent) => ({
      ...agent,
      password: agent.password || null, // ✅ Ensure it's always null if undefined
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
      lastLoginAt: agent.lastLoginAt?.toISOString() || null,
      emailVerified: agent.emailVerified?.toISOString() || null,
      accounts: agent.accounts.map((acc) => ({
        ...acc,
        createdAt: acc.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch agents with accounts');
  }
}

// ✅ Get all admins with accounts AND password field
export async function getAllAdminsWithAccounts() {
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
        emailVerified: true,
        phone: true,
        image: true,
        password: true, // ✅ Included
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            type: true,
            providerAccountId: true,
            createdAt: true,
          },
        },
      },
    });

    return admins.map((admin) => ({
      ...admin,
      password: admin.password || null, // ✅ Ensure it's always null if undefined
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
      lastLoginAt: admin.lastLoginAt?.toISOString() || null,
      emailVerified: admin.emailVerified?.toISOString() || null,
      accounts: admin.accounts.map((acc) => ({
        ...acc,
        createdAt: acc.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch admins with accounts');
  }
}

// Get all users (non-admin, non-agent) - Basic info (kept for backward compatibility)
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
        phone: true,
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

// Get all agents - Basic info (kept for backward compatibility)
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
        phone: true,
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

// Get all admins - Basic info (kept for backward compatibility)
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
        phone: true,
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

    revalidatePath('/admin/users/users-list');
    revalidatePath('/admin/users/agents-list');
    revalidatePath('/admin/users/admins-list');

    return { success: true, user: updatedUser };
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    revalidatePath('/admin/users/users-list');
    revalidatePath('/admin/users/agents-list');
    revalidatePath('/admin/users/admins-list');

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

    const adminToDelete = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true },
    });

    if (adminToDelete?.isAdmin) {
      // Count total active admins (including the one being deleted)
      const totalAdmins = await prisma.user.count({
        where: {
          isAdmin: true,
          isActive: true,
        },
      });

      // If only 1 admin exists, prevent deletion
      if (totalAdmins === 1) {
        throw new Error('Cannot delete the last admin. At least one active admin must remain.');
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users/users-list');
    revalidatePath('/admin/users/agents-list');
    revalidatePath('/admin/users/admins-list');

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

    revalidatePath('/admin/users/users-list');
    revalidatePath('/admin/users/agents-list');
    revalidatePath('/admin/users/admins-list');

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reactivate user');
  }
}
