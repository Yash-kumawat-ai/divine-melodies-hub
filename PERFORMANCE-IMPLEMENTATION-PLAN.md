# Raghavam Performance Optimization — Implementation Plan (Approved with Corrections)

> **Author:** Performance Engineering Architecture  
> **Date:** 2026-08-30  
> **Status:** APPROVED — Ready for Execution  
> **Constraint:** Zero feature regressions allowed. Implement one phase at a time. Measure after each phase.

---

## 1. Goal & Performance Targets

### Intermediate Target (Phase A–B Milestones)
- **Mobile LCP:** < 5.0s (from 16.7s)
- **Mobile TBT:** < 400ms (from 760ms)
- **Mobile FCP:** < 2.0s (from 2.9s)
- **Mobile Speed Index:** < 6.0s (from 11.6s)
- **Mobile CLS:** < 0.10 (from 0.004)

### Final Production Target (Complete 13-Phase Roadmap)
- **Mobile Performance Score:** **≥ 90 / 100**
- **Mobile LCP:** **< 2.5s**
- **Mobile TBT:** **< 200ms**
- **Mobile FCP:** **< 1.8s**
- **Mobile CLS:** **< 0.10**
- **Desktop Performance Score:** **≥ 90 / 100**
- **Desktop LCP:** **< 1.5s**

---

## 2. Current Verified Baseline

| Metric | Mobile | Desktop | Status |
|---|---|---|---|
| **Performance Score** | 42 | 78 | Baseline |
| **Largest Contentful Paint (LCP)** | 16.7s | 1.9s | Baseline |
| **First Contentful Paint (FCP)** | 2.9s | 1.3s | Baseline |
| **Total Blocking Time (TBT)** | 760ms | 130ms | Baseline |
| **Speed Index (SI)** | 11.6s | 3.7s | Baseline |
| **Cumulative Layout Shift (CLS)** | 0.004 | 0.016 | Baseline |

### Build Baseline (dist/)
- `dist/assets/index-DU8wZwKO.js`: **538.5 kB**
- `dist/assets/supabase-BgQJfCCH.js`: **189.8 kB**
- `dist/assets/react-DyVRDzED.js`: **159.2 kB**
- `dist/assets/motion-Dipx4mPR.js`: **126.5 kB**
- `dist/assets/ui-BWBYjAa7.js`: **101.9 kB**
- `dist/assets/query-C2J7smuK.js`: **39.1 kB**
- **Total Critical Initial JS:** **1,155 kB** (~355 kB gzip)
- `dist/assets/index-BGF3qCGa.css`: **397.5 kB**
- Total JS chunk files: **119**

---

## 3. Mandatory Corrections & Invariants Incorporated

1. **Phase 13 (Splash):** Soft divine-light visual identity is **100% preserved**. Soft edges will be achieved using **static multi-stop radial and linear CSS gradients** (or static blur layers) with **opacity-only keyframe animations**. No animated `filter: blur(...)` or `filter: drop-shadow(...)` will run on the CPU/GPU rasterizer during the critical paint window.
2. **Phase 1 (LCP Preload):** SPA trade-off is acknowledged: on direct visits to non-Home deep links, the browser will preload `/hero-lcp-mobile.webp` (~77 kB). This is an acceptable SPA trade-off to guarantee immediate LCP discovery on the primary landing route without runtime JavaScript latency.
3. **Phase 4 (Carousel Wraparound):** The sliding window condition `Math.abs(offset) <= 2 || index === 0` uses the already-wrapped modular `offset` calculation (`offset -= numBanners` / `offset += numBanners`). This guarantees correct circular wrapping in both directions (0 → 1 → ... → 8 → 0 and 0 → 8).
4. **Phase 7 (Cache Headers):** Vite-hashed build assets in `dist/assets/` (`*.js`, `*.css`, and hashed images) receive `max-age=31536000, immutable`. Unhashed root public media (`/hero-lcp-mobile.webp`, `/mandala-logo.png`) receive a safe cache policy (`max-age=2592000, stale-while-revalidate=86400`) to prevent permanent client-side stale caches when images are updated.
5. **Phase 9 (Fonts):** Google Fonts asynchronous stylesheet loading is implemented conservatively with `font-display: swap` and tested for FOUT/CLS. If typography or layout shifts regress, it will be tuned or reverted.
6. **Execution Invariant:** One phase at a time. `npm run build`, bundle size inspection, TypeScript validation, and route testing after EVERY phase.

---

## 4. Phase-by-Phase Implementation Plan

---

### Phase 0 — Baseline Snapshot
**Action:** No code changes. Run `npm run build` and log baseline chunk sizes, hash values, and module presence.

---

### Phase 1 — Fix Mobile LCP Discovery
**File:** `index.html`  
**Root Cause:** Dynamic JS injection (`document.createElement('link')`) hides the mobile LCP image from the browser's C++ preload scanner. `/raghavam-logo.webp` (splash logo) steals `fetchpriority="high"`.

**Changes:**
1. Remove inline JS preload injection `<script> (function() { ... })(); </script>`.
2. Declare static responsive HTML preloads in `<head>`:
```html
<!-- Splash logo: standard priority -->
<link rel="preload" href="/raghavam-logo.webp" as="image" type="image/webp" />

<!-- Responsive LCP Hero Image Preloads: Scanner-discoverable -->
<link
  rel="preload"
  href="/hero-lcp-mobile.webp"
  as="image"
  type="image/webp"
  media="(max-width: 767px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="/hero-lcp-desktop.webp"
  as="image"
  type="image/webp"
  media="(min-width: 768px)"
  fetchpriority="high"
/>
```
**Verification:** Build passes; `/hero-lcp-mobile.webp` requested early during HTML streaming.

---

### Phase 2 — Code-Split Static Auth & Profile Routes
**File:** `src/App.tsx`  
**Root Cause:** `LoginForm`, `SignupTabs`, `AuthShell`, `AuthCallback`, and `CompleteBirthProfilePage` are statically imported in `App.tsx`, forcing `zod`, `dompurify`, and `react-hook-form` into the entry chunk.

**Changes:**
1. Convert the 5 imports to `React.lazy(() => import(...))`.
2. Wrap route elements with `<Suspense fallback={<SuspenseFallback />}>`.

**Verification:** Build passes; inspect `dist/assets/index-*.js` to verify `ZodString`, `DOMPurify`, and `loginSchema` are **absent** from the entry chunk. Test `/auth/login`, `/auth/signup`, `/auth/callback`, and `/auth/complete-profile`.

---

### Phase 3 — Reduce Mobile Drawer Initial DOM
**File:** `src/components/navigation/MobileDrawer/MobileDrawer.tsx`  
**Root Cause:** All 16 navigation items, Lucide icons, language accordion, settings, and footer mount into the DOM tree even when `isOpen === false`.

**Changes:**
1. Keep the outer `<div ref={drawerRef} role="dialog" ...>` shell mounted for CSS translate animations, focus trap, and touch swipe listeners.
2. Conditionally render the internal children: `{isOpen && ( <> <DrawerHeader ... /> ... <DrawerFooter ... /> </> )}`.

**Verification:** Build passes; drawer opens/closes smoothly; focus trap, Escape key, touch swipes, and body scroll lock work.

---

### Phase 4 — Optimize Mobile Carousel Slide Window
**File:** `src/components/PromotionalCarousel.tsx`  
**Root Cause:** All 9 banner cards and images mount simultaneously in the DOM.

**Changes:**
1. Inside `BANNERS.map((banner, index) => ...)`, use the circular modular offset calculation:
```tsx
let offset = index - currentIndex;
const half = Math.floor(numBanners / 2);
if (offset > half) offset -= numBanners;
else if (offset < -half) offset += numBanners;

// Only mount slides within ±2 of active position, plus always mount slide 0 (hero/LCP)
const shouldMount = index === 0 || Math.abs(offset) <= 2;
if (!shouldMount) return null;
```
2. Verify circular wraparound:
   - At index 0: mounts 8 (-1), 0 (0), 1 (+1), 2 (+2), 7 (-2). (5 slides)
   - At index 8: mounts 6 (-2), 7 (-1), 8 (0), 0 (+1), 1 (+2). (5 slides)

**Verification:** Build passes; carousel auto-rotates across 0 → 1 → ... → 8 → 0; swiping in both directions works without visual clipping.

---

### Phase 5 — Scope AssistantContext Provider
**File:** `src/App.tsx`  
**Root Cause:** `AssistantContextProvider` wraps the root tree but is only consumed by `AIAssistant.tsx` inside the lazy-loaded `AIAssistantModalHost`.

**Changes:**
1. Remove `AssistantContextProvider` from `App.tsx` root provider stack.
2. Wrap `<AIAssistantModalHost />` inside `{isOpen && ( <AssistantContextProvider> ... </AssistantContextProvider> )}`.
3. Keep `YouTubePlayerProvider` and `AIModalProvider` at top level for cross-route safety.

**Verification:** Build passes; Narad AI modal and widget function properly on interaction.

---

### Phase 6 — Optimize AnimatedBrandLogo GPU Workload
**File:** `src/components/AnimatedBrandLogo.tsx`  
**Root Cause:** Continuous CSS `drop-shadow()` keyframe pulse + SVG SMIL `<animate>` gradient triggers constant GPU/CPU rasterization on every frame.

**Changes:**
1. Replace `@keyframes logoGlowPulse` (which animates `drop-shadow`) with a static `filter: drop-shadow(...)` and a compositor-friendly `@keyframes logoOpacityPulse` (animates `opacity: 0.88` to `1`).
2. Remove SMIL `<animate>` tags from Hindi and English SVG gradient definitions; use rich static multi-stop gold gradients.
3. Add `@media (prefers-reduced-motion: reduce) { .animated-brand-logo { animation: none; } }`.

**Verification:** Build passes; logo renders gold and sharp in header with smooth opacity pulse; no scroll jank.

---

### Phase 7 — Cache Header Policy
**File:** `vite.config.ts` (closeBundle hook)  
**Root Cause:** Static media set to `max-age=604800` (7 days), triggering PageSpeed warnings.

**Changes:**
1. Differentiate hashed assets from unhashed public assets in `.htaccess`:
```apache
<IfModule mod_headers.c>
  <FilesMatch "^index\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  <FilesMatch "\.(?:js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.(?:woff2|woff)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.(?:webp|avif|png|jpg|jpeg|gif|svg)$">
    Header set Cache-Control "public, max-age=2592000, stale-while-revalidate=86400"
  </FilesMatch>
</IfModule>
```

**Verification:** Build passes; inspect `dist/.htaccess`.

---

### Phase 8 — CSS Extraction (Conservative)
**Files:** `src/index.css`, `src/styles/fullcalendar-overrides.css` (NEW), `src/pages/PanchangPage.tsx`  
**Root Cause:** ~6 kB of FullCalendar and Panchang calendar styles are bundled in global `index.css`.

**Changes:**
1. Extract `.fc-*`, `.festival-*`, and `.panchang-*` rules from `src/index.css` into `src/styles/fullcalendar-overrides.css`.
2. Import `import '@/styles/fullcalendar-overrides.css';` inside `PanchangPage.tsx`.

**Verification:** Build passes; global CSS shrinks by ~6 kB; Panchang calendar styling remains identical.

---

### Phase 9 — Font Loading Optimization
**File:** `index.html`  
**Root Cause:** Synchronous Devanagari Google Font stylesheet blocks First Contentful Paint.

**Changes:**
1. Apply `media="print" onload="this.media='all'"` to the primary Devanagari stylesheet.
2. Add `<noscript>` fallback.
3. Keep `font-display: swap` in the Google Fonts query parameter.

**Verification:** Build passes; measure FCP/CLS; Hindi text renders immediately with fallback and swaps cleanly.

---

### Phase 10 — Forced Reflow Optimization
**File:** `src/components/navigation/MobileDrawer/NavigationItem.tsx`  
**Root Cause:** JS ripple effect calls `clientWidth` / `getBoundingClientRect` and mutates DOM on click.

**Changes:**
1. Remove `handleRipple` JavaScript function and DOM injection.
2. Add CSS active state: `active:scale-[0.97] active:opacity-80`.

**Verification:** Build passes; drawer links provide responsive touch feedback with zero layout thrashing.

---

### Phase 11 & 12 — Image & Supabase Audits
- **Phase 11 (Images):** Verified that large PNGs are on lazy routes. No code changes in this cycle.
- **Phase 12 (Supabase):** Verified queries run in parallel batches via React Query. No code changes in this cycle.

---

### Phase 13 — Splash Screen Optimization (Soft Aesthetic Preserved)
**File:** `index.html`  
**Root Cause:** Continuous keyframe animation of CSS `filter: blur(...)` and scale transforms on `#loading-splash` causes GPU rasterization during page load.

**Changes:**
1. **Preserve Soft Divine-Light Appearance:** Keep the soft gradient diffusion by defining rich multi-stop radial and linear CSS gradients (static blur layer where needed).
2. **Animate Opacity Only:**
   - `.divine-light-shaft-outer`: static gradient + opacity-only keyframe pulse.
   - `.divine-light-shaft-core`: static gradient + opacity-only keyframe pulse.
   - `.divine-light-center-bloom`: static radial gradient + opacity-only keyframe breathing (remove animated `filter: blur` and `transform: scale`).
3. Remove unneeded `will-change: transform`.

**Verification:** Build passes; splash screen retains soft divine glow, Sanskrit shloka, mandala logo, and animated dots; unmounts cleanly without CPU spikes.

---

## 5. Execution Checklist & Summary Table

| Phase | Target File | Core Improvement | Safety Check |
|---|---|---|---|
| **Phase 0** | None | Record build baseline | Zero code changes |
| **Phase 1** | `index.html` | Static responsive `<link rel="preload">` | Scanner discovery; no duplicate preloads |
| **Phase 2** | `src/App.tsx` | Lazy load 5 static auth routes | Removes `zod`/`dompurify` from entry |
| **Phase 3** | `MobileDrawer.tsx` | Conditional `{isOpen && (...) }` mount | Preserves outer shell & animations |
| **Phase 4** | `PromotionalCarousel.tsx` | Window slides `Math.abs(offset) <= 2` | Circular wraparound 0↔8 preserved |
| **Phase 5** | `src/App.tsx` | Scope `AssistantContextProvider` | Scoped to AI modal only |
| **Phase 6** | `AnimatedBrandLogo.tsx` | Static gold gradient + opacity pulse | Compositor-friendly; no SMIL |
| **Phase 7** | `vite.config.ts` | Refined `.htaccess` cache headers | Hashed immutable vs public stale-while-revalidate |
| **Phase 8** | `src/index.css`, `PanchangPage.tsx` | Extract FullCalendar CSS (~6 kB) | Scoped to Panchang route |
| **Phase 9** | `index.html` | Async Devanagari font stylesheet | Non-blocking FCP; FOUT/CLS monitored |
| **Phase 10** | `NavigationItem.tsx` | CSS `:active` replacing JS ripple | Zero layout thrashing on touch |
| **Phase 11** | None | Image pass deferred (non-Home) | No code changes |
| **Phase 12** | None | Supabase queries verified parallel | No code changes |
| **Phase 13** | `index.html` | Splash opacity pulse (soft glow kept) | Soft divine aesthetic 100% preserved |
