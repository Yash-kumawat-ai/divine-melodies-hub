-- Profile photos: column expected by the app (Header, Account page, ProfileHubSheet).
-- Safe to run multiple times.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.user_profiles.avatar_url IS 'Cloudinary (or CDN) URL for the user profile photo.';
