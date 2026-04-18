## Supabase Dashboard Runbook

### Objective
Validate production security settings that cannot be guaranteed by repo code alone.

### A. RLS Validation
1. Open Table Editor and verify RLS is ON for each critical table.
2. Confirm policies allow only intended actors:
- Public read only where required (for approved content only)
- Owner-only writes for user-owned records
- Admin-only read/write for moderation tables

### B. Auth Validation
1. Confirm production Site URL is exact production domain.
2. Confirm allowed redirect URLs are explicit and minimal.
3. Confirm email verification is enabled before privileged actions.

### C. Storage Validation
1. Verify bucket privacy mode for sensitive uploads.
2. Verify CORS allowlist is production domain only.
3. Verify size/type restrictions align with app policy.

### D. Secrets Validation
1. Check Edge Function secrets include required server-only keys.
2. Confirm no service role key in frontend environment files.
3. Rotate any leaked keys immediately.

### E. Backup and Recovery
1. Confirm PITR/backups enabled.
2. Run restore drill in staging and document time-to-recover.

### F. Launch Gate
- [ ] All critical checks above pass
- [ ] RLS tests executed with real authenticated users
- [ ] Upload unauthorized path returns 401
- [ ] Rate-limit path returns 429 when exceeded
