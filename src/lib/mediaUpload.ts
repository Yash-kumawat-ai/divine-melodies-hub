import { supabase } from '@/integrations/supabase/client';

export type SecureUploadType = 'lyrics' | 'avatar' | 'deity' | 'groups' | 'community';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MEDIA_UPLOAD_URL = (import.meta.env.VITE_MEDIA_UPLOAD_URL as string | undefined)?.trim() || '';

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

export function isHostingerMediaConfigured(): boolean {
  return MEDIA_UPLOAD_URL.length > 0;
}

/** Upload image to Hostinger disk; returns public HTTPS URL for Supabase columns. */
export async function uploadUserMedia(
  file: File,
  uploadType: SecureUploadType = 'lyrics'
): Promise<string> {
  if (!MEDIA_UPLOAD_URL) {
    throw new Error('VITE_MEDIA_UPLOAD_URL is not configured');
  }

  const prepared = prepareUploadFile(file);
  validateUploadFile(prepared);

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

  const response = await fetch(MEDIA_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const serverMessage =
      typeof data?.error === 'string' ? data.error : `Image upload failed (${response.status})`;
    throw new Error(serverMessage);
  }

  if (!data?.url || typeof data.url !== 'string') {
    throw new Error('Upload succeeded but no image URL was returned');
  }

  return data.url;
}
