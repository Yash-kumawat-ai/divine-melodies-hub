-- Add phone_number column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN phone_number TEXT UNIQUE NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.user_profiles.phone_number IS 'Optional phone number for the user. Stored as provided during signup.';

-- Update RLS policies to allow users to view and update their own phone_number
-- Note: Existing RLS policies already allow SELECT, UPDATE, INSERT on user_profiles for authenticated users matching their own ID
-- So no additional RLS policy changes needed - the existing policies will automatically cover phone_number

-- Create index for phone_number lookups (optional but recommended for performance)
CREATE INDEX idx_user_profiles_phone_number ON public.user_profiles(phone_number) WHERE phone_number IS NOT NULL;
