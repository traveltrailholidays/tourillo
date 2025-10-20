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

// Upload directory configuration
const UPLOAD_BASE = process.env.NODE_ENV === 'production' 
  ? '/var/www/app/uploads'
  : path.join(process.cwd(), 'uploads');

// Helper function to format Zod errors
function formatZodError(error: z.ZodError): string {
  return error.issues.map(issue => issue.message).join(', ');
}

// Ensure upload directory exists
async function ensureUploadDir(folder: string = 'listings') {
  const uploadDir = path.join(UPLOAD_BASE, folder);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Upload and compress image
export async function uploadBlogImage(
  formData: FormData,
  folder: string = 'listings'
): Promise<ImageUploadResult> {
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
    const uploadDir = await ensureUploadDir(folder);
    
    // Generate unique filename
    const fileName = `${uuid()}.webp`;
    const filePath = path.join(uploadDir, fileName);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process and compress image with Sharp
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 85,
        effort: 6 
      })
      .toBuffer();
    
    // Save compressed image
    await fs.writeFile(filePath, compressedBuffer);
    
    // Return URL path
    const relativePath = `/uploads/${folder}/${fileName}`;
    
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
    // Support both old /blogs/ and new /uploads/ paths
    if (!imagePath.startsWith('/blogs/') && !imagePath.startsWith('/uploads/')) {
      return false;
    }
    
    // Handle old path format
    let fullPath: string;
    if (imagePath.startsWith('/blogs/')) {
      // Old format: /blogs/filename.jpg
      fullPath = path.join(process.cwd(), 'public', imagePath);
    } else {
      // New format: /uploads/listings/filename.webp
      const relativePath = imagePath.replace('/uploads/', '');
      fullPath = path.join(UPLOAD_BASE, relativePath);
    }
    
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Generate multiple sizes for responsive images
export async function generateResponsiveImages(
  originalBuffer: Buffer,
  fileName: string,
  folder: string = 'listings'
): Promise<string[]> {
  const uploadDir = await ensureUploadDir(folder);
  const baseName = path.parse(fileName).name;
  const generatedPaths: string[] = [];
  
  const sizes = [
    { width: 400, height: 300, suffix: 'sm' },
    { width: 800, height: 600, suffix: 'md' },
    { width: 1200, height: 900, suffix: 'lg' },
  ];
  
  try {
    for (const size of sizes) {
      const sizedFileName = `${baseName}-${size.suffix}.webp`;
      const sizedFilePath = path.join(uploadDir, sizedFileName);
      
      const processedBuffer = await sharp(originalBuffer)
        .resize(size.width, size.height, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toBuffer();
        
      await fs.writeFile(sizedFilePath, processedBuffer);
      generatedPaths.push(`/uploads/${folder}/${sizedFileName}`);
    }
  } catch (error) {
    console.error('Error generating responsive images:', error);
  }
  
  return generatedPaths;
}

// Image validation only (without upload)
export async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  const validation = imageSchema.safeParse({ file });
  
  if (!validation.success) {
    return {
      valid: false,
      error: formatZodError(validation.error),
    };
  }

  return { valid: true };
}

// Batch image upload function
export async function uploadMultipleBlogImages(
  formData: FormData,
  folder: string = 'listings'
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];
  const files = formData.getAll('files') as File[];

  for (const file of files) {
    const singleFileFormData = new FormData();
    singleFileFormData.append('file', file);
    
    const result = await uploadBlogImage(singleFileFormData, folder);
    results.push(result);
  }

  return results;
}
