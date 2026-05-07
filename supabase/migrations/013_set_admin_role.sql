-- Fix: Set initial admin accounts
-- Run this to make existing users admins

-- Set yashkumawatai@gmail.com as super_admin
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'yashkumawatai@gmail.com'
AND role IS NULL;

-- Also set any existing users to admin if they have activity
UPDATE user_profiles 
SET role = 'admin' 
WHERE role IS NULL 
AND id IN (
  SELECT user_id FROM user_uploads WHERE status = 'approved'
);