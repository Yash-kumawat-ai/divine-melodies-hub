## Production Checklist (Manual)

1. Authentication
- [ ] Site URL set to production domain only
- [ ] Redirect URLs contain only approved auth callback URLs
- [ ] Google provider enabled with OAuth Client ID and Client Secret
- [ ] Google Cloud OAuth redirect URI set to `https://<project-ref>.supabase.co/auth/v1/callback`
- [ ] Supabase redirect allowlist includes app callbacks such as `/auth/callback`
- [ ] Email confirmation required before upload privileges
- [ ] Custom SMTP configured before testing real user email/password signup
- [ ] Custom branded email templates configured after SMTP is working

2. Database
- [ ] RLS toggle ON for all public tables
- [ ] Realtime disabled on high-risk tables unless explicitly required
- [ ] pgcrypto extension enabled for UUID generation
- [ ] Backup/PITR enabled for production tier

3. API & Network
- [ ] Allowed origins restricted to production domain (no wildcard)
- [ ] Service role key stored only in Supabase Edge Function secrets
- [ ] IP restrictions enabled if your infrastructure supports stable egress IPs

4. Storage
- [ ] Buckets used for sensitive uploads are private
- [ ] CORS origin allowlist includes only production domain
- [ ] File size limit set to 5MB for lyric images
- [ ] MIME whitelist enforced to jpeg/png/webp

5. Observability
- [ ] Enable API error alerts in Supabase dashboard
- [ ] Monitor auth failures and suspicious rate spikes
- [ ] Monitor edge function error rates and latency

See `docs/supabase-google-oauth-setup.md` for the exact Google OAuth URL mapping used by this app.

Email/password signup sends a confirmation email. If Supabase returns `Error sending confirmation email`, configure `Authentication > Emails > SMTP Settings` in the Supabase Dashboard or temporarily disable email confirmations during local development. Google auth does not depend on the Supabase confirmation email sender.
