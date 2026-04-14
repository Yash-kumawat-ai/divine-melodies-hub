# 🔍 SQL Verification Queries
## Run these in Supabase SQL Editor to verify all data storage

---

## 🔐 **PART 1: USER LOGIN DATA VERIFICATION**

### Check All Registered Users
```sql
-- See all users who have registered
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as signup_date,
  up.name,
  up.avatar_url,
  COUNT(uu.id) as bhajans_uploaded
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN user_uploads uu ON au.id = uu.user_id
GROUP BY au.id, au.email, au.created_at, up.name, up.avatar_url
ORDER BY au.created_at DESC;
```

### Check User Count Statistics
```sql
-- Get user statistics
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Users with Profiles' as metric,
  COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
  'Users who Uploaded' as metric,
  COUNT(DISTINCT user_id) as count
FROM user_uploads;
```

### Find Specific User
```sql
-- Replace 'email@example.com' with actual email
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  up.name,
  up.avatar_url,
  up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'email@example.com';
```

---

## 📿 **PART 2: BHAJAN DATA VERIFICATION**

### Check All Uploaded Bhajans
```sql
-- See all bhajans in database
SELECT 
  u.id,
  u.title,
  u.title_hindi,
  u.singer_name,
  u.composer_name,
  up.name as uploader_name,
  u.deity_id,
  u.status,
  u.play_count,
  u.like_count,
  u.created_at
FROM user_uploads u
JOIN user_profiles up ON u.user_id = up.id
ORDER BY u.created_at DESC
LIMIT 20;
```

### Check Bhajan Count by Status
```sql
-- Count bhajans by approval status
SELECT 
  COALESCE(status, 'NULL') as status,
  COUNT(*) as count
FROM user_uploads
GROUP BY status
UNION ALL
SELECT 
  'TOTAL' as status,
  COUNT(*) as count
FROM user_uploads;
```

### Check Bhajans by User
```sql
-- See bhajans uploaded by specific user
-- Replace 'user@example.com' with actual email
SELECT 
  u.title,
  u.title_hindi,
  u.singer_name,
  u.status,
  u.play_count,
  u.created_at
FROM user_uploads u
JOIN user_profiles up ON u.user_id = up.id
WHERE up.email = 'user@example.com'
ORDER BY u.created_at DESC;
```

---

## 🖼️ **PART 3: IMAGE STORAGE VERIFICATION**

### Verify Cloudinary Images
```sql
-- Check which images are stored in Cloudinary
SELECT 
  u.id,
  u.title,
  u.image_url,
  CASE 
    WHEN u.image_url LIKE '%cloudinary.com%' THEN '✅ Cloudinary'
    WHEN u.image_url LIKE '%res.cloudinary.com%' THEN '✅ Cloudinary (CDN)'
    WHEN u.image_url ISNULL THEN '⚠️ No Image'
    ELSE '❌ Other Source'
  END as image_source,
  CASE
    WHEN u.image_url LIKE '%w_%' THEN '✅ Optimized'
    WHEN u.image_url LIKE '%query%' THEN '⚠️ Needs Optimization'
    ELSE 'N/A'
  END as optimization
FROM user_uploads u
WHERE u.image_url IS NOT NULL
ORDER BY u.created_at DESC;
```

### Count Images by Source
```sql
-- Statistics about image storage
SELECT 
  CASE 
    WHEN image_url LIKE '%cloudinary.com%' THEN 'Cloudinary'
    WHEN image_url ISNULL THEN 'No Image'
    ELSE 'Other'
  END as source,
  COUNT(*) as count
FROM user_uploads
GROUP BY source;
```

### Find Missing Images
```sql
-- Find bhajans without images
SELECT 
  id,
  title,
  singer_name,
  created_at
FROM user_uploads
WHERE image_url IS NULL OR image_url = ''
ORDER BY created_at DESC;
```

---

## 📊 **PART 4: ENGAGEMENT DATA VERIFICATION**

### Check Ratings and Likes
```sql
-- See engagement metrics
SELECT 
  'Bhajan Ratings' as metric,
  COUNT(*) as count
FROM bhajan_ratings
UNION ALL
SELECT 
  'User Likes' as metric,
  COUNT(*) as count
FROM user_likes
UNION ALL
SELECT 
  'User Playlists' as metric,
  COUNT(*) as count
FROM user_playlists;
```

### Top Rated Bhajans
```sql
-- Show most liked/rated bhajans
SELECT 
  u.title,
  u.singer_name,
  u.play_count,
  u.like_count,
  u.average_rating,
  u.rating_count,
  up.name as uploader
FROM user_uploads u
LEFT JOIN user_profiles up ON u.user_id = up.id
WHERE u.status = 'approved'
ORDER BY u.average_rating DESC, u.like_count DESC
LIMIT 10;
```

---

## 🔗 **PART 5: DATA RELATIONSHIPS VERIFICATION**

### Verify Referential Integrity
```sql
-- Check that all bhajans are linked to valid users
SELECT 
  'Bhajans with valid user_id' as check_name,
  COUNT(*) as count
FROM user_uploads u
WHERE EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = u.user_id)
UNION ALL
SELECT 
  'Bhajans with missing user_id' as check_name,
  COUNT(*) as count
FROM user_uploads u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = u.user_id);
```

### Check All User-Uploaded Relationships
```sql
-- Verify data consistency
SELECT 
  COUNT(DISTINCT u.user_id) as users_with_uploads,
  COUNT(*) as total_bhajans,
  AVG(CAST(upload_count AS DECIMAL)) as avg_bhajans_per_user
FROM (
  SELECT user_id, COUNT(*) as upload_count
  FROM user_uploads
  GROUP BY user_id
) subq;
```

---

## 📈 **PART 6: PERFORMANCE & STATISTICS**

### Overall Statistics
```sql
-- Complete overview of data
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_uploads) as total_bhajans,
  (SELECT COUNT(*) FROM user_uploads WHERE status = 'approved') as approved_bhajans,
  (SELECT COUNT(*) FROM user_likes) as total_likes,
  (SELECT COUNT(*) FROM bhajan_ratings) as total_ratings,
  (SELECT COUNT(*) FROM user_playlists) as total_playlists
;
```

### Database Size
```sql
-- Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Recent Activity
```sql
-- Last 10 actions (newest first)
SELECT 
  title as item,
  'Bhajan Uploaded' as action,
  created_at as timestamp
FROM user_uploads
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🆘 **PART 7: TROUBLESHOOTING QUERIES**

### Find Broken Data
```sql
-- Check for data integrity issues
SELECT 
  'Missing image URLs' as issue,
  COUNT(*) as count
FROM user_uploads
WHERE image_url IS NULL
UNION ALL
SELECT 
  'Approved with no lyrics' as issue,
  COUNT(*) as count
FROM user_uploads
WHERE status = 'approved' AND (lyrics_hindi IS NULL OR lyrics_hindi = '')
UNION ALL
SELECT 
  'No singer name' as issue,
  COUNT(*) as count
FROM user_uploads
WHERE singer_name IS NULL OR singer_name = '';
```

### Find Orphaned Records
```sql
-- Check for data orphans
SELECT 
  'Uploads from deleted users' as issue,
  COUNT(*) as count
FROM user_uploads u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = u.user_id)
UNION ALL
SELECT 
  'Ratings for deleted bhajans' as issue,
  COUNT(*) as count
FROM bhajan_ratings br
WHERE NOT EXISTS (SELECT 1 FROM user_uploads u WHERE u.id = br.bhajan_id)
UNION ALL
SELECT 
  'Playlists from deleted users' as issue,
  COUNT(*) as count
FROM user_playlists up
WHERE NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = up.user_id);
```

### Check Permissions
```sql
-- Verify Row-Level Security policies are working
-- This should return empty if RLS is properly configured
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_uploads', 'bhajan_ratings', 'user_likes')
GROUP BY tablename;
```

---

## 🚀 **PART 8: VERIFICATION SCRIPT (Run All)**

Run this complete script to get a full verification report:

```sql
-- ============ COMPLETE VERIFICATION REPORT ============

-- 1. USER DATA
WITH user_stats AS (
  SELECT 
    COUNT(DISTINCT au.id) as total_users,
    COUNT(DISTINCT up.id) as users_with_profiles,
    COUNT(DISTINCT uu.user_id) as users_with_uploads
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.id
  LEFT JOIN user_uploads uu ON au.id = uu.user_id
),

-- 2. BHAJAN DATA
bhajan_stats AS (
  SELECT 
    COUNT(*) as total_bhajans,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN image_url LIKE '%cloudinary%' THEN 1 END) as with_cloudinary_images,
    COUNT(CASE WHEN image_url IS NULL THEN 1 END) as without_images
  FROM user_uploads
),

-- 3. ENGAGEMENT DATA
engagement_stats AS (
  SELECT 
    COUNT(DISTINCT user_id) as users_with_likes,
    COUNT(DISTINCT user_id) as users_with_ratings
  FROM (
    SELECT user_id FROM user_likes
    UNION ALL
    SELECT user_id FROM bhajan_ratings
  ) stats
)

SELECT 
  'USERS' as category,
  user_stats.*
FROM user_stats
UNION ALL
SELECT 
  'BHAJANS' as category,
  bhajan_stats.*
FROM bhajan_stats
UNION ALL
SELECT 
  'ENGAGEMENT' as category,
  engagement_stats.*
FROM engagement_stats;
```

---

## 📋 **HOW TO USE THESE QUERIES**

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Select Your Project**: divine-melodies-hub
3. **Click**: SQL Editor (under Development)
4. **Paste** any query above
5. **Click**: "Run" or press Ctrl+Enter
6. **View Results**

---

## ✅ **INTERPRETATION GUIDE**

### Good Signs ✅
- Users count increasing
- Bhajans have Cloudinary image URLs
- Most bhajans are 'approved' status
- Average rating > 0
- No orphaned records

### Warning Signs ⚠️
- Many bhajans without images
- Many users with no profiles
- Ratings exist but no corresponding bhajans
- Broken foreign key relationships

### Things to Check Monthly 📊
- Total user growth
- Average bhajans per user
- Image storage costs (Cloudinary)
- Database size growth
- Active engagement (likes, ratings)

---

**Note**: Run these queries regularly to monitor your application health!
