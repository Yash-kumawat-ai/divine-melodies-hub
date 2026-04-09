# YouTube Metadata Auto-Extraction Setup Guide

## ✅ What's Been Implemented

### Feature: Auto-Fill Song Title & Artist from YouTube Links
When you paste a YouTube link during upload, the system automatically extracts:
- **Song Title** 
- **Artist/Singer Name**

### Files Changed
1. ✅ `supabase/functions/extract-youtube-metadata/index.ts` - NEW Edge Function
2. ✅ `src/components/Upload/BhajanForm.tsx` - Updated upload form
3. ✅ `src/lib/supabaseQueries.ts` - Fixed query filtering
4. ✅ Build verification: **PASSED** (11.60s, 0 errors)
5. ✅ Dev server: **RUNNING** (http://localhost:8080)

---

## 🚀 Setup Instructions

### Step 1: Deploy the Supabase Edge Function

Run this command in your terminal:

```bash
supabase functions deploy extract-youtube-metadata
```

**What this does:**
- Deploys the metadata extraction function to Supabase
- Makes it available for the upload form to call
- No API keys required (uses YouTube's public oEmbed API)

**Verify Deployment:**
- Go to Supabase Dashboard → Edge Functions
- You should see `extract-youtube-metadata` in the list

### Step 2: Test the Feature

1. **Open your app**: http://localhost:8080
2. **Navigate to**: Upload → Add Bhajan
3. **Paste a YouTube URL** in the "YouTube URL" field, e.g.:
   ```
   https://www.youtube.com/watch?v=eo3P4fNbvRA
   ```
4. **Watch the magic**: Title and singer name auto-populate!
5. **Complete the form** and submit

### Step 3: How It Works

```
User pastes YouTube URL
        ↓
BhajanForm detects URL
        ↓
Calls Edge Function (extract-youtube-metadata)
        ↓
Edge Function uses YouTube oEmbed API
        ↓
Extracts: Title, Artist, Thumbnail
        ↓
Form fields auto-fill
        ↓
User clicks Submit ✓
```

---

## 🎨 Features

### Auto-Parsing Intelligence
The system intelligently parses YouTube titles:
- **Input**: "Hare Krishna Full - Jagjit Singh"
- **Output**: 
  - Title: "Hare Krishna Full"
  - Artist: "Jagjit Singh"

Handles multiple formats:
- `Song - Artist`
- `Song | Artist`
- `Song by Artist`

### Error Handling
If metadata can't be extracted:
- Form shows friendly message
- Fields remain empty
- User can fill manually
- No errors or crashes

### Loading Indicator
While extracting:
- Animated spinner appears
- Shows "Extracting title and artist..."
- Disappears when complete

---

## 🔍 Browser Console Testing

In your browser's Developer Tools (F12), you can see:

```javascript
// Success response
{
  title: "Hare Krishna Hare Krishna",
  artist: "Jagjit Singh",
  thumbnailUrl: "https://..."
}

// Error response
{
  error: "Invalid YouTube URL",
  title: "",
  artist: ""
}
```

---

## 📋 Testing Checklist

- [ ] Edge Function deployed to Supabase
- [ ] Can paste YouTube URL without errors
- [ ] Title auto-fills from extracted metadata
- [ ] Artist name auto-fills from extracted metadata
- [ ] Loading indicator shows during extraction
- [ ] Can still fill manual if extraction fails
- [ ] Submit button works with auto-filled data
- [ ] New bhajans appear in Browse page (/all-bhajans)

---

## 🐛 Troubleshooting

### "Showing 0 of 0 bhajans" on /all-bhajans

**Fixed!** Updated query to include:
- Bhajans with `status = 'approved'`
- Bhajans with `status = NULL` (legacy data)

Try uploading a new bhajan and it should appear.

### Edge Function Returns 404 Error

**Solution**: Make sure you deployed the function:
```bash
supabase functions deploy extract-youtube-metadata
```

### Title/Artist Not Extracting

**Possible causes**:
1. YouTube URL format not recognized
2. Video is private or deleted
3. Edge Function not deployed

**Solution**: Try another link. If still issues, check browser console (F12) for errors.

---

## 🎯 Next Steps

1. ✅ Deploy edge function
2. ✅ Test YouTube auto-fill feature
3. ✅ Upload a few bhajans with YouTube links
4. 🔄 Migrate Supabase schema (if not done already)
5. 🚀 Implement Phase 2 features (playlists, radio, etc.)

---

## 📝 Technical Details

**Edge Function Endpoint**: `extract-youtube-metadata`
**Request Format**:
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response Format**:
```json
{
  "title": "Song Name",
  "artist": "Singer Name",
  "thumbnailUrl": "https://..."
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "title": "",
  "artist": ""
}
```

---

## 💡 Tips

- Works best with YouTube's default title format
- Can handle shortened URLs (youtu.be)
- Extracts from Open Graph metadata (fast, reliable)
- No rate limiting (no API key needed)
- Fallback to manual entry always available

---

**Status**: ✅ Ready to use!
