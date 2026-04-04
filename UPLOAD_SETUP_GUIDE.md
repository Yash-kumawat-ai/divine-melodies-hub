# Upload Bhajan System - Setup Guide 🚀

## Complete Step-by-Step Setup

### Step 1: Run Database Migration in Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project "divine-melodies-hub"
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire content from: `supabase/migrations/001_create_user_uploads_table.sql`
6. Paste it in the SQL Editor
7. Click **Run** (CMD + Enter or Click the Play button)

You should see "Success" message ✅

---

### Step 2: Enable Email Confirmations (Optional but Recommended)

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Go to **Email Templates**
4. You can customize the confirmation email if you want

---

### Step 3: Test the System Locally

```bash
# Make sure your dev server is running
npm run dev

# Visit the app
http://localhost:8080/
```

---

### Step 4: Try the Upload Feature

1. Click **Upload** in the navbar (or visit `/upload-bhajan`)
2. Click **Sign up** to create a test account
3. Enter email: `test@example.com`
4. Enter password: `Test@123456` (at least 6 characters)
5. Click **Sign Up**
6. Check your email for confirmation link (if configured)
7. Go back and **Login**
8. Now you should be able to upload bhajans!

---

## Features Now Available ✨

### For Users:
- ✅ Sign up with email/password
- ✅ Login to account
- ✅ Upload bhajan photo
- ✅ Type/paste bhajan lyrics
- ✅ Fill bhajan details (title, deity, singer)
- ✅ Submit bhajan

### Backend:
- ✅ Stores uploads in Supabase database
- ✅ Tracks submission status
- ✅ Links uploads to user accounts
- ✅ Secure with Row-Level Security (RLS)

---

## Architecture Overview

```
User Upload Flow:
└── Sign Up / Login (Supabase Auth)
    └── Upload Page
        ├── Step 1: Upload Photo (FileUpload.tsx)
        ├── Step 2: Enter Lyrics (TextExtractor.tsx)
        └── Step 3: Fill Details (BhajanForm.tsx)
            └── Save to: user_uploads table
```

---

## Database Schema

### user_uploads Table:
```
- id: Unique identifier
- user_id: Links to authenticated user
- title: English title
- title_hindi: Hindi title
- deity_id: Which deity (1-8)
- singer_name: Who sings it
- composer_name: Who composed it
- lyrics_hindi: The actual lyrics
- image_url: Uploaded photo (if stored)
- status: 'pending', 'approved', or 'rejected'
- created_at: Upload timestamp
- approved_at: When admin approved
- admin_notes: Admin feedback
```

---

## Environment Variables

Already set in `.env.local`:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`
- ✅ `VITE_OPENAI_API_KEY`

---

## File Structure Created

```
src/
├── hooks/
│   └── useAuth.ts               (Auth logic)
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx        (Login page)
│   │   └── SignupForm.tsx       (Signup page)
│   └── Upload/
│       ├── FileUpload.tsx       (Photo upload)
│       ├── TextExtractor.tsx    (Lyrics input)
│       └── BhajanForm.tsx       (Bhajan details)
├── pages/
│   └── UploadBhajan.tsx         (Main upload page)
└── Header.tsx                   (Updated with Upload/Logout)
```

---

## Troubleshooting

### "Supabase Auth not working"
- Check `.env.local` has correct keys
- Make sure Supabase project is active

### "Can't upload - database error"
- Run the SQL migration from Step 1
- Check Supabase SQL Editor for errors

### "Upload button doesn't appear"
- Make sure you're logged in
- Check browser console for errors

---

## Next Steps

### Option 1: Add Admin Panel
- Create page to approve/reject uploads
- Add to admin dashboard

### Option 2: Auto-Add to Library
- Automatically add approved bhajans to main library
- Create merge function

### Option 3: Better OCR
- Integrate Tesseract.js for automatic text extraction
- Parse image → Bhajan form auto-fill

### Option 4: Image Processing
- Compress images before upload
- Create thumbnails for library

---

## Support

If you face any issues:
1. Check browser console for errors (F12)
2. Check Supabase logs: Dashboard → Logs
3. Make sure all files are created correctly
4. Restart dev server: `npm run dev`

---

**You're all set!** 🎉 The upload system is now live!

Visit `/upload-bhajan` to start uploading bhajans.
