# Raghavam Typography & Numeric Standards

This internal guide documents Raghavam's multi-script typography architecture, digit normalization guidelines, and CI lint quality gates. Any engineer adding new devotional or astrological features (Panchang, Kundli, Bhajan, Posters, Community) must adhere to these standards.

---

## 1. The Core Architecture: Two Typography Systems

Raghavam separates typography by **semantic role**, not simply by language toggle (`en` vs `hi`).

```text
                    RAGHAVAM TYPOGRAPHY
                            │
             ┌──────────────┴──────────────┐
             │                             │
       UI SYSTEM (Default)          DEVOTIONAL SYSTEM
             │                             │
    "Raghavam UI" (Composite)     Tiro Devanagari Hindi
             │                             │
     ┌───────┴───────┐              Sacred Verses,
     │               │              Mantras, Shlokas,
   Latin        Devanagari          Bhajan Lyrics
     │               │
   Inter         Noto Sans
     │          Devanagari
  Numerals
   (0-9)
```

### A. Primary UI System (`--font-ui` / `font-ui`)
- **Font Stack**: `"Raghavam UI", "Inter", "Noto Sans Devanagari", sans-serif`
- **Default for**: The entire application (`body`, forms, inputs, buttons, navigation, headers, tables, panchang metrics, kundli metadata).
- **Mechanism**: The composite `@font-face` uses `unicode-range`:
  - `U+0000-00FF` (Latin letters, digits `0–9`, punctuation) $\rightarrow$ **Inter Variable (100..900)**.
  - `U+0900-097F` (Devanagari script, Sanskrit ligatures) $\rightarrow$ **Noto Sans Devanagari Variable (400..700)**.
- **Why**: Eliminates manual string-wrapping hacks. In a single string:
  ```tsx
  <div>जयपुर, Rajasthan, India • 2005-02-05 15:00:00</div>
  ```
  `जयपुर` automatically renders in Noto Sans Devanagari, while `Rajasthan, India` and `2005-02-05` render in clean, flat-baseline Inter lining numerals.

### B. Devotional / Scripture System (`--font-devotional` / `font-devotional` / `font-hindi`)
- **Font Stack**: `"Tiro Devanagari Hindi", "Noto Sans Devanagari", serif`
- **Used exclusively for**: Sacred literature, holy shlokas, stotrams, daily mantras, and bhajan lyrics (e.g. `LyricsDisplay.tsx`, `DailyMantra.tsx`).
- **Rule**: NEVER make `Tiro Devanagari Hindi` the global font of the UI. Tiro uses medieval Old-Style figures (digits 3, 4, 5, 7, 9 dip below the baseline; 6 and 8 shoot up), which causes a wobbly "zig-zag" appearance on modern UI controls, counters, and dates.

---

## 2. Numeric Formatting Standards

Numbers in Raghavam are treated as **data**, completely independent from typography.

### Standard Rule: Always Produce Latin Digits (`0–9`)
In digital Hindi interfaces (UPI, railways, news, search), standard international Arabic numerals (`0–9`) are the modern standard for clarity, accessibility, and indexing.

### Helpers (`@/lib/formatNumber`)
```typescript
import { formatIndianNumber, toLatinDigits } from '@/lib/formatNumber';

// 1. For dynamic numbers with Indian comma grouping (lakhs, crores):
formatIndianNumber(1234567); // "12,34,567"

// 2. For sanitizing strings with stray Devanagari digits:
toLatinDigits("१०८ जप"); // "108 जप"
```

### Visual Stability with Tabular Numerals (`.tabular-nums`)
For anything numerical that changes or aligns vertically (playback timers, countdowns, planetary degrees, coordinates, dates):
```tsx
<span className="tabular-nums">00:00 / 04:35</span>
<span className="tabular-nums">12° 34' 56"</span>
```
This applies `font-variant-numeric: lining-nums tabular-nums;` to prevent layout shifts.

---

## 3. CI Quality Gate: Devanagari Digits Linter

To prevent regressions when new content or copy is pasted from external Hindi documents, an automated script runs in CI:

```bash
npm run lint:digits
```

- **Script**: `scripts/lint-devanagari-digits.cjs`
- **Check**: Fails with code 1 if any `[०-९]` characters exist in `src/`.
- **Exceptions**: If legitimate scriptural citations require traditional numerals, add the specific file path to `ALLOWLIST_FILES` inside `scripts/lint-devanagari-digits.cjs`.
