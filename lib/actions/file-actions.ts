'use server';

import fs from 'node:fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

// File validation schema
const imageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Image is required')
    .refine((file) => file.size <= 10000000, 'Image must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type),
      'Image must be JPEG, PNG, or WebP format'
    ),
});

type ImageUploadResult = {
  success: boolean;
  imagePath?: string;
  error?: string;
};

// Helper function to format Zod errors
function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

// Ensure upload directory exists
async function ensureUploadDir() {
  // CHANGED: Use absolute path that matches Nginx configuration
  const uploadDir =
    process.env.NODE_ENV === 'production'
      ? '/var/www/app/uploads' // Production path
      : path.join(process.cwd(), 'public', 'uploads'); // Local dev path

  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Upload and compress image
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

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();

    // Generate unique filename
    const fileName = `${uuid()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process and compress image with Sharp
    const compressedBuffer = await sharp(buffer)
      .normalize()
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    // Save compressed image
    await fs.writeFile(filePath, compressedBuffer);

    // CHANGED: Return /uploads/ path for both dev and production
    const relativePath = `/uploads/${fileName}`;

    return {
      success: true,
      imagePath: relativePath,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: 'Failed to upload and process image',
    };
  }
}

// Delete image file
export async function deleteBlogImage(imagePath: string): Promise<boolean> {
  try {
    // CHANGED: Handle /uploads/ path
    if (!imagePath.startsWith('/uploads/')) {
      return false;
    }

    // Extract filename from path
    const fileName = path.basename(imagePath);

    // Determine full path based on environment
    const uploadDir =
      process.env.NODE_ENV === 'production' ? '/var/www/app/uploads' : path.join(process.cwd(), 'public', 'uploads');

    const fullPath = path.join(uploadDir, fileName);

    await fs.unlink(fullPath);
    console.log('Image deleted successfully:', fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Generate multiple sizes for responsive images
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
