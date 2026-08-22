# live-aarti-check setup

## Architecture

Hostinger frontend → this Edge Function → `live_aarti_status` table (cache) → YouTube Data API (or scrape fallback) → DB → frontend shows LIVE.

## 1. Create YouTube Data API key

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **YouTube Data API v3**
4. Credentials → Create credentials → **API key**
5. Restrict the key:
   - API restrictions → YouTube Data API v3 only
   - (Optional) Application restrictions later

## 2. Apply DB migration

```bash
supabase db push
```

Or run `supabase/migrations/041_create_live_aarti_status.sql` in the SQL editor for project `khnqyhzlrxwmolyevaqo`.

## 3. Set Edge Function secret

```bash
supabase secrets set YOUTUBE_API_KEY=YOUR_KEY_HERE --project-ref khnqyhzlrxwmolyevaqo
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

## 4. Deploy function

```bash
supabase functions deploy live-aarti-check --project-ref khnqyhzlrxwmolyevaqo
```

Without `YOUTUBE_API_KEY`, the function still runs using HTML scrape fallback (less reliable from cloud IPs).

## 5. Frontend env (Hostinger build)

```
VITE_SUPABASE_URL=https://khnqyhzlrxwmolyevaqo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_or_publishable_key
```

Do **not** put the YouTube API key or service role key in Vite env.

## Quota note

Known live video IDs are re-checked with cheap `videos.list` (1 unit). Fresh discovery uses `search.list` (100 units). DB cache (~45–90s) keeps daily usage within the free 10k quota for normal traffic.
