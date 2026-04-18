## Supabase RLS Policy Matrix

This file documents expected access behavior for critical tables. Verify against SQL migrations and dashboard state before each release.

### user_uploads
- Read:
  - Public can read approved rows only
  - Admin can read all rows
  - Owner can read own rows
- Write:
  - Authenticated users can insert own rows
  - Owner can update own rows
  - Admin can update moderation-related columns

### user_profiles
- Read:
  - Public profile fields may be readable as needed
  - Owner can read full profile
  - Admin can read for moderation/support
- Write:
  - Owner can update own profile
  - Admin can update moderation flags/roles where required

### user_likes
- Read:
  - Owner can read own likes
  - Admin can read for abuse investigation
- Write:
  - Owner can insert/delete own likes only

### user_favorites
- Read:
  - Owner can read own favorites
- Write:
  - Owner can insert/delete own favorites only

### custom_deities
- Read:
  - Public can read approved/shared records
  - Owner can read own records
  - Admin can read all
- Write:
  - Owner can create/edit own records
  - Admin can moderate

### moderation_queue
- Read:
  - Admin only
- Write:
  - System and admin only

### upload_audit_log
- Read:
  - Admin only
- Write:
  - System writes

### admin_audit_log
- Read:
  - Admin only
- Write:
  - System/admin writes

### notifications
- Read:
  - Owner can read own notifications
  - Admin can read for support workflows
- Write:
  - System/admin writes

### Test Queries To Keep Handy
- Authenticated user cannot select another user's private rows
- Anonymous user cannot insert/update protected tables
- Admin user can access moderation tables
- Public user can only read explicitly public rows
