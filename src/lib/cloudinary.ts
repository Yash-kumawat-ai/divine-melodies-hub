/**
 * Cloudinary image upload utility
 * Uses unsigned uploads - no backend needed
 */

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  console.log('Cloudinary config:', { cloudName, uploadPreset });

  if (!cloudName) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME not set. Check .env.local file.');
  }

  if (!uploadPreset) {
    throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET not set. Check .env.local file.');
  }

  if (!cloudName.trim()) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME is empty. Update .env.local with your Cloudinary cloud name.');
  }

  if (!uploadPreset.trim()) {
    throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET is empty. Update .env.local with your upload preset.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('resource_type', 'auto');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Cloudinary error:', error);
      throw new Error(error.error?.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url; // Returns HTTPS URL
  } catch (error: any) {
    console.error('Upload error details:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
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
