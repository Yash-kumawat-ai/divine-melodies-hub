# Cloudinary Setup Guide

This app uses **Cloudinary** to handle image uploads. This is free and handles unlimited storage on their free tier.

## Why Cloudinary?

- **Free 25GB/month** image storage
- **Automatic optimization** - compresses images for web
- **CDN delivery** - fast worldwide distribution
- **No backend needed** - upload directly from React
- **Unlimited uploads** - scales with your bhajans database

## Step-by-Step Setup

### 1. Create Cloudinary Account
- Go to [Cloudinary.com](https://cloudinary.com)
- Sign up (free)
- Confirm email

### 2. Get Cloud Name
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Look for **Cloud Name** at the top
3. Copy it (e.g., "dhvj3k8f2")

### 3. Create Upload Preset
1. Go to **Settings** (gear icon)
2. Go to **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Set:
   - **Name**: `bhajan-uploads` (or any name)
   - **Unsigned**: Turn ON
   - **Auto-tag**: (leave blank)
   - **Folder**: `bhajans` (optional, for organization)
6. Save

### 4. Update `.env.local`
In your project root, update `.env.local`:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_from_step_2
VITE_CLOUDINARY_UPLOAD_PRESET=bhajan-uploads
```

### 5. Restart Dev Server
```bash
npm run dev
```

## How It Works

When users upload bhajans:
1. Image goes directly to Cloudinary (not your server)
2. You get back a URL like: `https://res.cloudinary.com/[cloud]/image/upload/[id]`
3. URL is saved in Supabase database
4. Displays on your site with automatic optimization

## Cost

**Free tier:**
- 25GB/month bandwidth
- Unlimited storage (for images)
- Automatic compression
- Perfect for 1000+ bhajans

**If you exceed:** Can upgrade to paid ($0.10/GB after free tier)

## Testing Upload

1. Run dev server: `npm run dev`
2. Go to `/upload-bhajan`
3. Sign up/login
4. Try uploading an image
5. Should see it upload to Cloudinary
6. Image URL saved in database

## Troubleshooting

**"Cloudinary config missing" error:**
- Check `.env.local` has both variables set
- No extra spaces or quotes
- Restart dev server after changes

**Upload stuck on "Uploading to Cloudinary...":**
- Check internet connection
- Verify Cloud Name and Upload Preset are correct
- Try smaller image file

**Images not displaying:**
- Check URL in database (should be `https://res.cloudinary.com/...`)
- Test URL directly in browser
- Check if image file is valid

## Next Steps

After setup:
1. Deploy user profile migrations to Supabase (in SQL Editor)
2. Test email/password signup
3. Upload a test bhajan with image + YouTube URL
4. Check Cloudinary dashboard to see image stored
