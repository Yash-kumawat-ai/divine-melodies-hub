import { supabase } from '@/integrations/supabase/client';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type SecureUploadType = 'lyrics' | 'avatar' | 'deity';

function validateUploadFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP files are allowed');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('File exceeds 5MB size limit');
  }
}

export async function uploadToCloudinary(file: File, uploadType: SecureUploadType = 'lyrics'): Promise<string> {
  validateUploadFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadType', uploadType);

  const { data, error } = await supabase.functions.invoke('upload-lyric-image', {
    body: formData,
  });

  if (error) {
    throw new Error(error.message || 'Secure upload gateway failed');
  }

  if (!data?.url || typeof data.url !== 'string') {
    throw new Error('Upload succeeded but no image URL was returned');
  }

  return data.url;
}

/**
 * Optimize Cloudinary URL for web display
 * Compresses and resizes image for better performance
 */
export function optimizeCloudinaryUrl(url: string, width: number = 500): string {
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // Insert transformation parameters before upload folder
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations = `w_${width},q_auto,f_auto`;
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}

/**
 * Delete image from Cloudinary (requires signed requests)
 * For now, images persist on Cloudinary
 */
export function generateCloudinaryUrl(publicId: string, width: number = 500): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_auto,f_auto/${publicId}`;
}
