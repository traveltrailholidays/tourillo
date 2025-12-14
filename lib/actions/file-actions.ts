'use server';

import fs from 'node:fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

// File validation schema - smaller limit since client compresses
const imageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Image is required')
    .refine((file) => file.size <= 5000000, 'Image must be less than 5MB after compression')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type),
      'Image must be JPEG, PNG, or WebP format'
    ),
});

type ImageUploadResult = {
  success: boolean;
  imagePath?: string;
  error?: string;
  originalSize?: string;
  finalSize?: string;
};

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

async function ensureUploadDir() {
  const uploadDir =
    process.env.NODE_ENV === 'production' ? '/var/www/app/uploads' : path.join(process.cwd(), 'public', 'uploads');

  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// ========================================
// BLOG IMAGE FUNCTIONS
// ========================================

export async function uploadBlogImage(formData: FormData): Promise<ImageUploadResult> {
  try {
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Validate file
    const validation = imageSchema.safeParse({ file });
    if (!validation.success) {
      return {
        success: false,
        error: formatZodError(validation.error),
      };
    }

    const uploadDir = await ensureUploadDir();
    const fileName = `blog-${uuid()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalSizeInMB = buffer.length / (1024 * 1024);

    // Light optimization to ensure consistent format
    const optimizedBuffer = await sharp(buffer)
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toBuffer();

    const finalSizeInMB = optimizedBuffer.length / (1024 * 1024);

    await fs.writeFile(filePath, optimizedBuffer);

    const relativePath = `/uploads/${fileName}`;

    return {
      success: true,
      imagePath: relativePath,
      originalSize: `${originalSizeInMB.toFixed(2)}MB`,
      finalSize: `${finalSizeInMB.toFixed(2)}MB`,
    };
  } catch (error) {
    console.error('Blog image upload error:', error);
    return {
      success: false,
      error: 'Failed to upload and process image',
    };
  }
}

export async function deleteBlogImage(imagePath: string): Promise<boolean> {
  try {
    if (!imagePath.startsWith('/uploads/')) {
      return false;
    }

    const fileName = path.basename(imagePath);
    const uploadDir =
      process.env.NODE_ENV === 'production' ? '/var/www/app/uploads' : path.join(process.cwd(), 'public', 'uploads');

    const fullPath = path.join(uploadDir, fileName);

    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting blog image:', error);
    return false;
  }
}

export async function generateResponsiveImages(originalBuffer: Buffer, fileName: string): Promise<string[]> {
  const uploadDir = await ensureUploadDir();
  const baseName = path.parse(fileName).name;
  const generatedPaths: string[] = [];

  const sizes = [
    { width: 400, height: 300, suffix: 'sm' },
    { width: 800, height: 600, suffix: 'md' },
    { width: 1200, height: 900, suffix: 'lg' },
  ];

  try {
    for (const size of sizes) {
      const sizedFileName = `${baseName}-${size.suffix}.jpg`;
      const sizedFilePath = path.join(uploadDir, sizedFileName);

      const processedBuffer = await sharp(originalBuffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      await fs.writeFile(sizedFilePath, processedBuffer);
      generatedPaths.push(`/uploads/${sizedFileName}`);
    }
  } catch (error) {
    console.error('Error generating responsive images:', error);
  }

  return generatedPaths;
}

// ========================================
// ITINERARY IMAGE FUNCTIONS
// Same /uploads folder, different filename prefix
// ========================================

export async function uploadItineraryImage(formData: FormData): Promise<ImageUploadResult> {
  try {
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Validate file
    const validation = imageSchema.safeParse({ file });
    if (!validation.success) {
      return {
        success: false,
        error: formatZodError(validation.error),
      };
    }

    const uploadDir = await ensureUploadDir();
    const fileName = `itinerary-${uuid()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalSizeInMB = buffer.length / (1024 * 1024);

    // Light optimization to ensure consistent format
    const optimizedBuffer = await sharp(buffer)
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toBuffer();

    const finalSizeInMB = optimizedBuffer.length / (1024 * 1024);

    await fs.writeFile(filePath, optimizedBuffer);

    const relativePath = `/uploads/${fileName}`;

    return {
      success: true,
      imagePath: relativePath,
      originalSize: `${originalSizeInMB.toFixed(2)}MB`,
      finalSize: `${finalSizeInMB.toFixed(2)}MB`,
    };
  } catch (error) {
    console.error('Itinerary image upload error:', error);
    return {
      success: false,
      error: 'Failed to upload and process itinerary image',
    };
  }
}

export async function deleteItineraryImage(imagePath: string): Promise<boolean> {
  try {
    if (!imagePath.startsWith('/uploads/')) {
      return false;
    }

    const fileName = path.basename(imagePath);
    const uploadDir =
      process.env.NODE_ENV === 'production' ? '/var/www/app/uploads' : path.join(process.cwd(), 'public', 'uploads');

    const fullPath = path.join(uploadDir, fileName);

    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting itinerary image:', error);
    return false;
  }
}
