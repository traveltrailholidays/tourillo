'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { uploadBlogImage, deleteBlogImage } from './file-actions';

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid UUID format');

// Blog validation schema
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().min(1, 'Excerpt is required').max(300),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  author: z.string().min(1, 'Author is required'),
  readTime: z.string().min(1, 'Read time is required'),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

// Type definitions
interface ActionState {
  error: Record<string, { _errors: string[] }> | null;
  message: string;
  success: boolean;
  blogId?: string;
}

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function validateUUID(id: string): string {
  return uuidSchema.parse(id);
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

// Create blog with state (for useActionState)
export async function createBlogWithState(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // Handle image upload first
    let imagePath: string | null = null;
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }
      imagePath = uploadResult.imagePath || null;
    }

    // Validate blog data
    const rawData = {
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      author: formData.get('author') as string,
      readTime: formData.get('readTime') as string,
      featured: formData.get('featured') === 'on',
      published: formData.get('published') === 'on',
    };

    const validatedData = blogSchema.parse(rawData);
    const slug = generateSlug(validatedData.title);

    // Check if slug already exists and make it unique
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    const finalSlug = existingBlog ? `${slug}-${Date.now()}` : slug;

    const blog = await prisma.blog.create({
      data: {
        ...validatedData,
        image: imagePath,
        slug: finalSlug,
      },
    });

    revalidatePath('/admin/blog/blog-list');
    revalidatePath('/blogs');

    return {
      error: null,
      message: 'Blog post created successfully!',
      success: true,
      blogId: blog.id,
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
      message: error instanceof Error ? error.message : 'Failed to create blog',
      success: false,
    };
  }
}

// Update blog with state (for useActionState)
export async function updateBlogWithState(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const blogId = formData.get('blogId') as string;
    const validatedId = validateUUID(blogId);

    const existingBlog = await prisma.blog.findUnique({
      where: { id: validatedId },
    });

    if (!existingBlog) {
      throw new Error('Blog not found');
    }

    let imagePath: string | null = existingBlog.image;
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('removeImage') === 'true';

    if (removeImage) {
      if (existingBlog.image) {
        await deleteBlogImage(existingBlog.image);
      }
      imagePath = null;
    } else if (imageFile && imageFile.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResult = await uploadBlogImage(imageFormData);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }

      if (existingBlog.image) {
        await deleteBlogImage(existingBlog.image);
      }

      imagePath = uploadResult.imagePath || null;
    }

    const rawData = {
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      author: formData.get('author') as string,
      readTime: formData.get('readTime') as string,
      featured: formData.get('featured') === 'on',
      published: formData.get('published') === 'on',
    };

    const validatedData = blogSchema.parse(rawData);
    const slug = generateSlug(validatedData.title);

    const existingSlugBlog = await prisma.blog.findFirst({
      where: {
        slug,
        NOT: { id: validatedId },
      },
    });

    const finalSlug = existingSlugBlog ? `${slug}-${Date.now()}` : slug;

    await prisma.blog.update({
      where: { id: validatedId },
      data: {
        ...validatedData,
        image: imagePath,
        slug: finalSlug,
      },
    });

    revalidatePath('/admin/blog/blog-list');
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${finalSlug}`);

    return {
      error: null,
      message: 'Blog post updated successfully!',
      success: true,
      blogId: validatedId,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: null,
        message: 'Invalid form data: ' + formatZodError(error),
        success: false,
        blogId: prevState.blogId,
      };
    }
    return {
      error: null,
      message: error instanceof Error ? error.message : 'Failed to update blog',
      success: false,
      blogId: prevState.blogId,
    };
  }
}

// Delete blog
export async function deleteBlog(id: string): Promise<void> {
  try {
    const validatedId = validateUUID(id);

    const blog = await prisma.blog.findUnique({
      where: { id: validatedId },
    });

    if (blog?.image) {
      await deleteBlogImage(blog.image);
    }

    await prisma.blog.delete({
      where: { id: validatedId },
    });

    revalidatePath('/admin/blog/blog-list');
    revalidatePath('/blogs');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error('Failed to delete blog');
  }
}

// Get all blogs
export async function getAllBlogs() {
  try {
    return await prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch blogs');
  }
}

// Get blogs for table
export async function getAllBlogsForTable() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return blogs.map((blog) => ({
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    date: blog.date ? blog.date.toISOString() : null,
  }));
}

// Get published blogs
export async function getPublishedBlogs() {
  try {
    return await prisma.blog.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch published blogs');
  }
}

// Get blog by ID
export async function getBlogById(id: string) {
  try {
    const validatedId = validateUUID(id);

    return await prisma.blog.findUnique({
      where: { id: validatedId },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid UUID format');
    }
    throw new Error('Failed to fetch blog');
  }
}

// Get blog by slug
export async function getBlogBySlug(slug: string) {
  try {
    return await prisma.blog.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch blog');
  }
}

// Get blogs by category
export async function getBlogsByCategory(category: string) {
  try {
    return await prisma.blog.findMany({
      where: {
        category,
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch blogs by category');
  }
}

// Get featured blogs
export async function getFeaturedBlogs() {
  try {
    return await prisma.blog.findMany({
      where: {
        featured: true,
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch featured blogs');
  }
}
