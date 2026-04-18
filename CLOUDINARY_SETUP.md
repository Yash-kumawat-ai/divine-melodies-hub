# Cloudinary Setup Guide

This app uses **Cloudinary** to handle image uploads through a **Supabase Edge Function gateway**.

## Why Cloudinary?

- **Free 25GB/month** image storage
- **Automatic optimization** - compresses images for web
- **CDN delivery** - fast worldwide distribution
- **Signed server-side uploads** - browser never receives upload preset or API secret
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

### 3. Create/Collect API Credentials
1. Open **Dashboard** -> **API Keys**
2. Collect:
   - **Cloud name**
   - **API key**
   - **API secret**
3. Keep API secret server-side only

### 4. Update `.env.local`
In your project root, update `.env.local`:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_from_step_2
```

### 5. Configure Supabase Edge Function Secrets
Set these in Supabase project secrets (not frontend env files):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_MODERATION=aws_rek
```

### 6. Restart Dev Server
```bash
npm run dev
```

## How It Works

When users upload bhajans:
1. Image goes from browser to `upload-lyric-image` Edge Function
2. Edge Function validates auth, MIME, size, and rate limits
3. Edge Function signs upload and sends to Cloudinary
4. You get back a URL like: `https://res.cloudinary.com/[cloud]/image/upload/[id]`
5. URL is saved in Supabase database
6. Displays on your site with automatic optimization

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
5. Should see it upload via Edge Function and then appear in Cloudinary
6. Image URL saved in database

## Troubleshooting

**"Cloudinary config missing" error:**
- Check `.env.local` has `VITE_CLOUDINARY_CLOUD_NAME`
- No extra spaces or quotes
- Restart dev server after changes

**Upload stuck on "Uploading...":**
- Check internet connection
- Verify Edge Function secrets are configured in Supabase
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
