export function validateEnv() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_CLOUDINARY_CLOUD_NAME',
  ];
  
  const missing: string[] = [];
  
  for (const key of required) {
    const value = import.meta.env[key];
    if (!value || value.startsWith('your-') || value.includes('your-')) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }
}

export function getEnv(key: string, fallback = ''): string {
  return import.meta.env[key] || fallback;
}