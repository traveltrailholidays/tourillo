'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Contact validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Create contact
export async function createContact(data: z.infer<typeof contactSchema>) {
  try {
    const validatedData = contactSchema.parse(data);

    await prisma.contact.create({
      data: validatedData,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to submit contact form');
  }
}

// Get all contacts
export async function getAllContacts() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return contacts.map((contact) => ({
      ...contact,
      createdAt: contact.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch contacts');
  }
}

// Get unread count
export async function getUnreadContactCount() {
  try {
    return await prisma.contact.count({
      where: {
        isRead: false,
      },
    });
  } catch (error) {
    console.error(error);
    return 0;
  }
}

// Mark as read
export async function markContactAsRead(id: string) {
  try {
    await prisma.contact.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath('/admin/contact');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark as read');
  }
}

// Mark as unread
export async function markContactAsUnread(id: string) {
  try {
    await prisma.contact.update({
      where: { id },
      data: { isRead: false },
    });

    revalidatePath('/admin/contact');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark as unread');
  }
}

// Delete contact
export async function deleteContact(id: string) {
  try {
    await prisma.contact.delete({
      where: { id },
    });

    revalidatePath('/admin/contact');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete contact');
  }
}
