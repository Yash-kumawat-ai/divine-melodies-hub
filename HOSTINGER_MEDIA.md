# Hostinger media (files) + Supabase (data)

User images are saved on Hostinger disk. Supabase keeps auth and table rows with a **public URL** only.

```
Browser --JWT + file--> https://raghavam.online/api/media/upload.php
                              |-- writes public_html/uploads/{type}/{userId}/{uuid}.ext
                              |-- returns https://raghavam.online/uploads/...
Browser --image_url---------> Supabase Postgres
```

Do not store image BLOBs in MySQL. That fills the 1 MB database and is slower than disk.

## 1. Copy files on Hostinger

From this repo, upload:

| Repo path | On Hostinger |
|-----------|----------------|
| `hostinger/api/media/*.php` (not `config.example.php` as the live name) | `public_html/api/media/` |
| `hostinger/uploads/.htaccess` | `public_html/uploads/.htaccess` |

Keep the Vite SPA in `public_html/` as today. The `api/` folder sits **beside** `index.html`, not inside the JS bundle.

1. Create folder `public_html/uploads` (writable, e.g. `755`).
2. Copy `config.example.php` to `public_html/api/media/config.php`.
3. Edit `config.php`:
   - `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` — same as `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `PUBLIC_BASE_URL` — `https://raghavam.online`
   - `UPLOAD_ROOT` — `__DIR__ . '/../../uploads'` if config is in `api/media/`
4. Never commit `config.php` or database passwords.

## 2. Frontend env

In Hostinger (or CI) build env, add:

```
VITE_MEDIA_UPLOAD_URL=https://raghavam.online/api/media/upload.php
```

Rebuild and deploy the SPA. If this variable is set, uploads skip Cloudinary and hit Hostinger.

Localhost without this variable still uses Cloudinary / the Edge Function (dev fallback).

## 3. Smoke test

1. Log in on the live site.
2. Upload an avatar or community image.
3. Confirm the file appears under `public_html/uploads/avatars/` or `bhajans/`.
4. Confirm Supabase `avatar_url` / `image_url` is `https://raghavam.online/uploads/...`.
5. Optional curl (replace TOKEN):

```bash
curl -X POST "https://raghavam.online/api/media/upload.php" \
  -H "Authorization: Bearer TOKEN" \
  -F "uploadType=lyrics" \
  -F "file=@photo.jpg"
```

## 4. Delete

`POST https://raghavam.online/api/media/delete.php` with JSON `{ "path": "bhajans/{userId}/{file}.jpg" }` and the same Bearer token. Only the owning user id in the path can delete.

## 5. Rollback

Remove `VITE_MEDIA_UPLOAD_URL` and rebuild. Old Cloudinary URLs in Supabase keep working.
