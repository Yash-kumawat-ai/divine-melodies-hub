import { supabase } from '@/integrations/supabase/client';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'divine_upload';

export type SecureUploadType = 'lyrics' | 'avatar' | 'deity';

/** Readable message from Error, PostgrestError, or other thrown values. */
export function formatUploadError(err: unknown, fallback = 'Upload failed'): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

function inferImageMimeType(file: File): string {
  const raw = (file.type || '').toLowerCase();
  if (raw === 'image/jpg') return 'image/jpeg';
  if (ALLOWED_TYPES.includes(raw)) return raw;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const byExt: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return byExt[ext] ?? raw;
}

/** Mobile galleries often omit MIME; normalize before validation/upload. */
function prepareUploadFile(file: File): File {
  const type = inferImageMimeType(file);
  if (type && ALLOWED_TYPES.includes(type) && type !== file.type) {
    const safeName = file.name?.trim() || `photo.${type === 'image/png' ? 'png' : 'jpg'}`;
    return new File([file], safeName, { type, lastModified: file.lastModified });
  }
  return file;
}

function validateUploadFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP files are allowed');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('File exceeds 5MB size limit');
  }
}

function canTryUnsignedFallback(status: number, serverMessage: string): boolean {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) return false;
  if (status === 429) return false;
  if (status === 400 && serverMessage.toLowerCase().includes('unsupported file type')) return false;
  return (
    status === 404 ||
    status >= 500 ||
    serverMessage.includes('Cloudinary server credentials') ||
    serverMessage.includes('Rate limit check failed') ||
    serverMessage.includes('upload gateway')
  );
}

export async function uploadToCloudinary(file: File, uploadType: SecureUploadType = 'lyrics'): Promise<string> {
  const prepared = prepareUploadFile(file);
  validateUploadFile(prepared);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase upload gateway is not configured');
  }

  // If running on localhost and we have Cloudinary credentials, we skip the Edge Function
  // to avoid browser CORS console errors from the non-deployed Supabase function.
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const canDoUnsigned = !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_UPLOAD_PRESET;

  if (isLocalhost && canDoUnsigned) {
    console.log("Localhost environment detected: Using direct Cloudinary upload to avoid console CORS warnings.");
    return uploadToCloudinaryUnsigned(prepared, uploadType);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Please log in before uploading an image');
  }

  const formData = new FormData();
  formData.append('file', prepared);
  formData.append('uploadType', uploadType);

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/upload-lyric-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_KEY,
      },
      body: formData,
    });
  } catch (err) {
    console.warn("Signed upload via Supabase Edge Function failed, trying direct Cloudinary fallback:", err);
    try {
      return await uploadToCloudinaryUnsigned(prepared, uploadType);
    } catch (fallbackErr) {
      console.error("Direct Cloudinary fallback also failed:", fallbackErr);
      throw new Error(
        `Upload failed. Supabase Edge Function is not deployed or has CORS issues, and direct Cloudinary upload failed: ${formatUploadError(fallbackErr)}`
      );
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const serverMessage =
      typeof data?.error === 'string' ? data.error : `Image upload failed (${response.status})`;

    if (canTryUnsignedFallback(response.status, serverMessage) || uploadType === 'avatar') {
      try {
        return await uploadToCloudinaryUnsigned(prepared, uploadType);
      } catch (fallbackErr) {
        throw new Error(`${serverMessage} (${formatUploadError(fallbackErr, 'direct upload failed')})`);
      }
    }

    throw new Error(serverMessage);
  }

  if (!data?.url || typeof data.url !== 'string') {
    throw new Error('Upload succeeded but no image URL was returned');
  }

  return data.url;
}

async function uploadToCloudinaryUnsigned(file: File, uploadType: SecureUploadType): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing (VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET is not set).');
  }

  const fallbackForm = new FormData();
  fallbackForm.append('file', file);
  fallbackForm.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  fallbackForm.append('folder', uploadType === 'avatar' ? 'avatars' : uploadType === 'deity' ? 'deities' : 'bhajans');

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: fallbackForm,
    });
  } catch {
    throw new Error('Could not reach Cloudinary. Check your internet connection and upload preset.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || `Cloudinary upload failed (${response.status})`);
  }

  if (!data?.secure_url || typeof data.secure_url !== 'string') {
    throw new Error('Upload succeeded but no image URL was returned');
  }

  return data.secure_url;
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
