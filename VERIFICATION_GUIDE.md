# ✅ Data Storage Verification Guide

This document provides a complete verification checklist for confirming that:
- Login data (user authentication) is stored in Supabase
- Bhajans are stored in Supabase database
- Images are stored in Cloudinary

---

## 🔍 **PART 1: Configuration Verification**

### ✅ Supabase Configuration Found
```
Environment Variables Set:
- VITE_SUPABASE_URL: ✓ https://khnqyhzlrxwmolyevaqo.supabase.co
- VITE_SUPABASE_PUBLISHABLE_KEY: ✓ sb_publishable_5y0b6pR1zhLSC5WGGV5Ezg_QaAKytPK
```

**Status**: Connected to actual Supabase project ✅

### ✅ Cloudinary Configuration Found
```
Environment Variables Set:
- VITE_CLOUDINARY_CLOUD_NAME: ✓ dca1u5vpb
- VITE_CLOUDINARY_UPLOAD_PRESET: ✓ divine_upload
```

**Status**: Configured for unsigned image uploads ✅

---

## 🔐 **PART 2: Authentication & Login Data Storage**

### Configuration in Code
📁 File: [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
- Client is initialized with Supabase credentials
- `persistSession: true` - Sessions are saved to localStorage
- `autoRefreshToken: true` - Tokens auto-refresh

📁 File: [src/hooks/useAuth.ts](src/hooks/useAuth.ts)
- Uses `supabase.auth.signUp()` for registration
- Creates `user_profiles` table entry for each user
- Subscribes to auth state changes

### Database Schema - User Login Storage
📁 File: [supabase/migrations/002_create_user_profiles.sql](supabase/migrations/002_create_user_profiles.sql)

**Table**: `user_profiles`
```sql
- id (UUID) → Links to auth.users
- email (TEXT) → User email
- name (TEXT) → User display name
- avatar_url (TEXT) → Profile picture
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Triggers**:
- ✅ Automatic profile creation on signup
- ✅ Row-level security enabled
- ✅ Users can only access their own profile

**Verification Steps**:
1. Go to: https://supabase.com → Your Project
2. Navigate: Authentication → Users
3. You should see all registered users
4. Click each user to see their email and signup date
5. Check: Database → Tables → `user_profiles` for name and avatar

---

## 📿 **PART 3: Bhajan Data Storage**

### Configuration in Code
📁 File: [src/components/Upload/BhajanForm.tsx](src/components/Upload/BhajanForm.tsx)
```typescript
// Line ~112: Data is saved to Supabase
const { error: insertError } = await supabase
  .from('user_uploads')
  .insert([
    {
      user_id: user.id,
      title: title,
      title_hindi: titleHindi,
      deity_id: parseInt(deityId),
      singer_name: singerName,
      composer_name: composerName || '',
      lyrics_hindi: lyrics,
      image_url: imageUrl,  // From Cloudinary
      youtube_url: youtubeUrl,
      status: 'approved',
    },
  ]);
```

### Database Schema - Bhajan Storage
📁 File: [supabase/migrations/001_create_user_uploads_table.sql](supabase/migrations/001_create_user_uploads_table.sql)

**Table**: `user_uploads`
```sql
- id (BIGSERIAL) → Unique bhajan ID
- user_id (UUID) → Who uploaded it
- title (TEXT) → English title
- title_hindi (TEXT) → Hindi title
- deity_id (INTEGER) → Deity reference
- singer_name (TEXT) → Singer
- composer_name (TEXT) → Composer
- lyrics_hindi (TEXT) → Full lyrics text
- image_url (TEXT) → Cloudinary URL
- youtube_url (TEXT) → YouTube link
- status (TEXT) → 'pending'/'approved'/'rejected'
- play_count (INTEGER) → Number of plays
- like_count (INTEGER) → Number of likes
- created_at (TIMESTAMP) → Upload time
```

**Permissions**:
- ✅ Users can view only their own uploads (private)
- ✅ Public viewing policy for approved bhajans
- ✅ Only authenticated users can upload

**Verification Steps**:
1. Go to: https://supabase.com → Your Project
2. Navigate: Database → Tables → `user_uploads`
3. Check if you see uploaded bhajans with:
   - User ID linked to auth
   - Image URL starting with `https://res.cloudinary.com/`
   - Status showing 'approved' or 'pending'

---

## 🖼️ **PART 4: Image Storage in Cloudinary**

### Configuration in Code
📁 File: [src/lib/cloudinary.ts](src/lib/cloudinary.ts)

**Upload Function**:
```typescript
// Sends images to Cloudinary (unsigned upload)
const response = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  {
    method: 'POST',
    body: formData,  // Contains file + upload_preset
  }
);
// Returns: data.secure_url → stored in user_uploads.image_url
```

**Features**:
- ✅ Automatic optimization (compression, format conversion)
- ✅ HTTPS URLs returned
- ✅ Image resizing on-the-fly
- ✅ No backend authentication needed (unsigned upload)

**Verification Steps**:
1. Go to: https://cloudinary.com → Dashboard
2. Media Library → Images
3. Filter by: "divine_upload" (the upload preset)
4. Verify you see uploaded bhajan images
5. Check transformation URLs: `w_500,q_auto,f_auto`

---

## 🧪 **PART 5: Full Flow Testing**

### Test Registration & Login
1. Open app: http://localhost:5173
2. Click "Upload Bhajan" or access protected pages
3. See LoginForm popup
4. **Register**:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
5. **Verify in Supabase**:
   ```
   ✓ Check: Authentication → Users → see new user
   ✓ Check: Database → user_profiles → see user name
   ```

### Test Bhajan Upload
1. After login, upload a bhajan:
   - Select deity
   - Upload lyrics (image or text)
   - Fill: Title, Hindi Title, Singer, Composer
   - Optional: YouTube URL
2. **Verify in Supabase**:
   ```
   ✓ Check: Database → user_uploads → new row with all data
   ✓ Check: user_id matches logged-in user
   ✓ Check: image_url is Cloudinary URL
   ✓ Check: status is 'approved'
   ```
3. **Verify in Cloudinary**:
   ```
   ✓ Check: Media Library → image appears
   ✓ Check: Public ID matches storage path
   ```

### Test Data Retrieval
1. Go to: Browse/Search Bhajans page
2. **Verify in Console**:
   ```
   ✓ Network tab → XHR requests to supabase
   ✓ Console → No auth errors
   ✓ See bhajans loading from database
   ```

---

## 📊 **PART 6: SQL Queries to Verify Data**

Run these queries in Supabase SQL Editor to verify data:

### Check All Users
```sql
SELECT 
  au.id,
  au.email,
  up.name,
  up.avatar_url,
  up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY up.created_at DESC;
```

### Check All Uploaded Bhajans
```sql
SELECT 
  u.id,
  u.title,
  u.singer_name,
  u.image_url,
  up.name as uploader,
  u.status,
  u.created_at
FROM user_uploads u
JOIN user_profiles up ON u.user_id = up.id
ORDER BY u.created_at DESC;
```

### Verify Image URLs are Cloudinary
```sql
SELECT 
  u.title,
  u.image_url,
  CASE 
    WHEN u.image_url LIKE '%cloudinary.com%' THEN '✅ Cloudinary'
    WHEN u.image_url = '' THEN '⚠️ Empty'
    ELSE '❌ Other Source'
  END as image_source
FROM user_uploads u
WHERE u.image_url IS NOT NULL;
```

### Count Statistics
```sql
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
  'Total Bhajans' as metric,
  COUNT(*) as count
FROM user_uploads
UNION ALL
SELECT 
  'Approved Bhajans' as metric,
  COUNT(*) as count
FROM user_uploads
WHERE status = 'approved';
```

---

## ✅ **PART 7: Quick Verification Checklist**

- [ ] Supabase credentials in `.env.local`
- [ ] Cloudinary credentials in `.env.local`
- [ ] Can register new user → appears in `auth.users`
- [ ] User profile created → appears in `user_profiles` table
- [ ] Can upload bhajan → appears in `user_uploads` table
- [ ] Bhajan image stored → URL in `image_url` column
- [ ] Image URL is Cloudinary → starts with `https://res.cloudinary.com/`
- [ ] Bhajan contains user ID → foreign key to auth
- [ ] Can browse uploaded bhajans → public access working
- [ ] Lyrics and metadata saved → all columns populated

---

## 🚀 **PART 8: Troubleshooting**

### Images Not Uploading to Cloudinary
```
Check:
1. VITE_CLOUDINARY_CLOUD_NAME is set
2. VITE_CLOUDINARY_UPLOAD_PRESET exists in Cloudinary
3. Upload preset is set to "Unsigned"
4. No CORS errors in browser console
```

### Bhajans Not Saving to Supabase
```
Check:
1. VITE_SUPABASE_URL is correct
2. VITE_SUPABASE_PUBLISHABLE_KEY is valid
3. user_uploads table exists (check migrations)
4. Row-level security policies allow INSERT
5. User is authenticated (check auth.uid())
```

### User Can't Login
```
Check:
1. Supabase Auth is enabled
2. Email/password provider is active
3. user_profiles trigger is working
4. No errors in browser console
```

---

## 📞 **Summary**

✅ **All 3 components are configured for production**:
1. **Login Data** → Stored in Supabase `auth.users` + `user_profiles`
2. **Bhajans** → Stored in Supabase `user_uploads` table
3. **Images** → Stored in Cloudinary with CDN delivery

**All data is persistent and backed up by Supabase and Cloudinary infrastructure.**
