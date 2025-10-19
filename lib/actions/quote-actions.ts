'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Quote validation schema - keeping existing fields
const quoteSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  date: z.string().min(1, 'Date is required'),
  days: z.number().min(1, 'Days must be at least 1'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

// Create quote
export async function createQuote(data: z.infer<typeof quoteSchema>) {
  try {
    const validatedData = quoteSchema.parse(data);

    await prisma.quote.create({
      data: validatedData,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid data: ' + error.issues.map((e) => e.message).join(', '));
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to submit quote request');
  }
}

// Get all quotes
export async function getAllQuotes() {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return quotes.map((quote) => ({
      ...quote,
      createdAt: quote.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch quotes');
  }
}

// Get unread count
export async function getUnreadQuoteCount() {
  try {
    return await prisma.quote.count({
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
export async function markQuoteAsRead(id: string) {
  try {
    await prisma.quote.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath('/admin/quotes/quotes-list');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark as read');
  }
}

// Mark as unread
export async function markQuoteAsUnread(id: string) {
  try {
    await prisma.quote.update({
      where: { id },
      data: { isRead: false },
    });

    revalidatePath('/admin/quotes/quotes-list');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to mark as unread');
  }
}

// Delete quote
export async function deleteQuote(id: string) {
  try {
    await prisma.quote.delete({
      where: { id },
    });

    revalidatePath('/admin/quotes/quotes-list');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete quote');
  }
}
