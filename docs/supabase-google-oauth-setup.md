# Supabase Google OAuth Setup

This app uses Supabase Auth with the PKCE flow and a React callback route at:

```text
/auth/callback
```

The app callback route exchanges the OAuth `code` for a Supabase session, then redirects to the safe `next` path. Google OAuth will not complete until both Google Cloud and Supabase Dashboard are configured with the URLs below.

## App URLs

Use the exact host and port where the app is running.

Local development:

```text
http://localhost:8080
http://localhost:8080/auth/callback
```

Production:

```text
https://your-domain.com
https://your-domain.com/auth/callback
```

If you run Vite on its default port instead of this repo's configured port, also add:

```text
http://localhost:5173
http://localhost:5173/auth/callback
```

## Supabase Dashboard

Open `Authentication > URL Configuration`.

Set `Site URL` to the canonical app URL:

```text
http://localhost:8080
```

For production, replace it with:

```text
https://your-domain.com
```

Add these redirect URLs:

```text
http://localhost:8080/auth/callback
https://your-domain.com/auth/callback
```

Only add preview URL wildcards if you actually use preview deployments. For production, prefer exact callback URLs.

Open `Authentication > Providers > Google`, enable Google, and paste the Google OAuth Client ID and Client Secret.

## Google Cloud Console

Create an OAuth Client ID with application type `Web application`.

Add Authorized JavaScript origins:

```text
http://localhost:8080
https://your-domain.com
```

Add Authorized redirect URI:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

Important: Google should use the Supabase Auth callback URL above, not this app's `/auth/callback` URL. Supabase receives Google's response first, then redirects back to the app callback route.

## Local Environment

Set the frontend Supabase project values:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
```

`VITE_SUPABASE_PUBLISHABLE_KEY` is also supported by the app, but use one key name consistently per environment.

Never put the Supabase service role key in a `VITE_` variable or frontend environment file.

## Verification

1. Start the app on `http://localhost:8080`.
2. Click the Google login button.
3. Approve the Google prompt.
4. Confirm the browser returns to `/auth/callback?code=...`.
5. Confirm the app redirects to `/upload-bhajan`.
6. Confirm the user appears in `Supabase Dashboard > Authentication > Users`.

If the callback opens without a `code`, the app should safely redirect to `/auth/login`.
