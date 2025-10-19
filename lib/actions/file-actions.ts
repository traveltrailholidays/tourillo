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
  return error.issues.map(issue => issue.message).join(', '); // FIXED: 'issues' not 'errors'
}

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'blogs');
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
    
    // Validate file - FIXED: Use 'issues' instead of 'errors'
    const validation = imageSchema.safeParse({ file });
    if (!validation.success) {
      return {
        success: false,
        error: formatZodError(validation.error), // FIXED: Use helper function
      };
    }

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();
    
    // Generate unique filename
    const fileName = `${uuid()}.jpg`; // Always save as .jpg after compression
    const filePath = path.join(uploadDir, fileName);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process and compress image with Sharp
    const compressedBuffer = await sharp(buffer)
      .normalize() // Normalize pixel values
      .resize(1200, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      }) // Resize to max 1200x800, maintain aspect ratio
      .jpeg({ 
        quality: 85, // 85% quality for good compression
        progressive: true,
        mozjpeg: true 
      })
      .toBuffer();
    
    // Save compressed image
    await fs.writeFile(filePath, compressedBuffer);
    
    // Return path relative to public folder
    const relativePath = `/blogs/${fileName}`;
    
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
    if (!imagePath.startsWith('/blogs/')) {
      return false;
    }
    
    const fullPath = path.join(process.cwd(), 'public', imagePath);
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
  fileName: string
): Promise<string[]> {
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
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
        
      await fs.writeFile(sizedFilePath, processedBuffer);
      generatedPaths.push(`/blogs/${sizedFileName}`);
    }
  } catch (error) {
    console.error('Error generating responsive images:', error);
  }
  
  return generatedPaths;
}

// Advanced image processing with watermark
export async function uploadBlogImageWithWatermark(
  formData: FormData,
  watermarkPath?: string
): Promise<ImageUploadResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'No file provided',
      };
    }
    
    // Validate file - FIXED: Use helper function
    const validation = imageSchema.safeParse({ file });
    if (!validation.success) {
      return {
        success: false,
        error: formatZodError(validation.error), // FIXED: Use helper function
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
    
    let sharpInstance = sharp(buffer)
      .normalize()
      .resize(1200, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });

    // Add watermark if provided
    if (watermarkPath && await fs.access(watermarkPath).then(() => true).catch(() => false)) {
      const watermark = await sharp(watermarkPath)
        .resize(200, 200, { fit: 'inside' })
        .png()
        .toBuffer();

      sharpInstance = sharpInstance.composite([{
        input: watermark,
        gravity: 'southeast',
        blend: 'overlay'
      }]);
    }
    
    const compressedBuffer = await sharpInstance
      .jpeg({ 
        quality: 85,
        progressive: true,
        mozjpeg: true 
      })
      .toBuffer();
    
    // Save compressed image
    await fs.writeFile(filePath, compressedBuffer);
    
    // Return path relative to public folder
    const relativePath = `/blogs/${fileName}`;
    
    return {
      success: true,
      imagePath: relativePath,
    };
    
  } catch (error) {
    console.error('Image upload with watermark error:', error);
    return {
      success: false,
      error: 'Failed to upload and process image with watermark',
    };
  }
}

// Batch image upload function
export async function uploadMultipleBlogImages(
  formData: FormData
): Promise<ImageUploadResult[]> {
  const results: ImageUploadResult[] = [];
  const files = formData.getAll('files') as File[];

  for (const file of files) {
    const singleFileFormData = new FormData();
    singleFileFormData.append('file', file);
    
    const result = await uploadBlogImage(singleFileFormData);
    results.push(result);
  }

  return results;
}

// Image validation only (without upload)
export async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  const validation = imageSchema.safeParse({ file });
  
  if (!validation.success) {
    return {
      valid: false,
      error: formatZodError(validation.error), // FIXED: Use helper function
    };
  }

  return { valid: true };
}
