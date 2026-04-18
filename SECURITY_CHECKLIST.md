## Security Checklist

### Phase 0: Secret Containment
- [ ] No client-side OpenAI API keys in any tracked file
- [ ] No `VITE_CLOUDINARY_UPLOAD_PRESET` in frontend tracked files
- [ ] Git history scan shows no active secret matches
- [ ] Leaked keys revoked and rotated

### Phase 1: Policy and Dashboard
- [ ] `supabase/policies.md` reviewed against live dashboard
- [ ] `docs/supabase-dashboard-runbook.md` executed in staging
- [ ] `docs/supabase-dashboard-config.md` completed
- [ ] `docs/cloudinary-dashboard-config.md` completed

### Phase 2: Upload Path Hardening
- [ ] Client upload flow is `client -> edge function -> Cloudinary`
- [ ] Edge function enforces auth, MIME, size, and rate limit
- [ ] Edge function returns 401/429 correctly
- [ ] Browser no longer sends upload preset to Cloudinary

### Phase 3: Embed and Client Hardening
- [ ] All YouTube iframes use sandbox + restrictive allow list
- [ ] Outbound window links use `noopener,noreferrer`
- [ ] NotFound page uses SPA navigation

### Phase 4: Build and Test Quality
- [ ] Type checking runs in CI
- [ ] Unit tests cover security-critical helpers
- [ ] Playwright checks unauthorized upload path

### Phase 5: Launch Gate
- [ ] SAST/dependency scan clean
- [ ] Security checklist signed off
- [ ] Staging smoke test complete
- [ ] Rollback plan documented
