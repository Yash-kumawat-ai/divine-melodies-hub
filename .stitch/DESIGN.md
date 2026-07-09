# Divine Melodies Hub — Complete Website Design System & Design Specification

This document provides a highly detailed, comprehensive design system and specification for the entire **Divine Melodies Hub** platform. All visual styles, design tokens, page layout structures, navigation trees, and database schemas have been extracted directly from the live codebase.

---

## 1. System Architecture & Tech Stack
- **Frontend Stack**: React (TypeScript) + Vite + TailwindCSS + Radix UI + Lucide Icons + Framer Motion.
- **Backend Infrastructure**: Supabase Database + Authentication + Edge Functions (moderation email triggers, automated notification queuing).
- **Core Assets**: Cloudinary Image Storage + YouTube Embed APIs.
- **Language Support**: Global dual-language structure (English and Hindi (`.lang-hi`, `.hindi-text` font families)).

---

## 2. Universal Design System Tokens

### A. Color Palette (HSL & Hex)
- **Primary / Saffron**: `hsl(30 100% 50%)` (#FF6B00)
- **Secondary / Gold**: `hsl(40 80% 55%)` (#F5A623)
- **Accent / Red-Orange**: `hsl(15 90% 55%)`
- **Maroon**: `hsl(0 60% 30%)`
- **Cream / Background**: `hsl(38 60% 96%)` / `hsl(30 50% 97%)` (#FFF8F0 / #FFF8EE)
- **Brand Brown / Dark**: `#3B1F0A` / `#1a1006`
- **Dark Mode Background**: `hsl(20 25% 8%)`
- **Dark Mode Foreground**: `hsl(35 30% 90%)`

### B. Typography
- **Default Display & Body Fonts**: `"Faculty Glyphic"`, `"Noto Sans Devanagari"`, `sans-serif` (mapped to `--font-display`, `--font-body`).
- **Hindi Localization Styles**: `"Tiro Devanagari Hindi"`, `"Noto Sans Devanagari"`, `serif` (mapped to `--font-hindi`). Enabled automatically by `.lang-hi` on text bodies, headings, buttons, and inputs.
- **Typography Scale**:
  - Base Body: `18px` (`lineHeight: 24px`)
  - Large (`lg`): `20px`
  - Extra Large (`xl`): `24px`
  - 2X Large (`2xl`): `28px`
  - 3X Large (`3xl`): `32px`
  - 4X Large (`4xl`): `40px`
  - 5X Large (`5xl`): `48px`

### C. Layout Elements & Radii
- **Border Radii**: `lg: var(--radius)` (12px / 0.75rem), `md: calc(var(--radius) - 2px)` (10px), `sm: calc(var(--radius) - 4px)` (8px).
- **Sacred Card Components (`.temple-panel`)**: Rounded-3xl borders (`rounded-[1.75rem]`), amber outlines (`border-amber-300/20`), translucent frosted-glass card backgrounds (`bg-card/90 backdrop-blur-md`).
- **Shadow Tokens**: `--temple-shadow` representing glowing spiritual depth: `0 10px 40px -10px hsl(30 60% 30% / 0.2)`.

### D. Keyframe Animations (CSS & Tailwind)
- **`glow-pulse`**: Transitions card glows and borders slowly (`3s ease-in-out infinite`).
- **`float`**: Smooth vertical floating hover transitions for deity cards and hero components (`6s ease-in-out infinite`).
- **`narad-fab-breathe`**: Breathing pulsing glows for voice triggers (`3s ease-in-out infinite`).
- **`flower-fall`**: Falling flower petal physics (combines rotation, sway, spin, and scale parameters).
- **`bell-swing-ring`**: Physics-based bell swing ring rotation for temple aarti simulations.
- **`smoke-rise`**: Particle effect for incense sticks (transforms scaling, translation, and blurring).
- **`halo-rays`**: Infinite rotating halo light effect (`24s linear infinite`).

---

## 3. Database Schema & Data Models

### A. Mantras
```typescript
interface Mantra {
  id: string;
  name_hindi: string;
  name_english: string;
  deity: string | null;
  description_hindi: string | null;
  description_english: string | null;
  meaning_hindi: string | null;
  meaning_english: string | null;
  full_text_hindi: string;
  transliteration: string | null;
  image_url: string | null;
  audio_url: string | null;
  recommended_counts: number[] | null; // e.g. [11, 21, 54, 108]
  sort_order: number;
  is_active: boolean;
}
```

### B. Japa Tracker Logs
```typescript
interface JapSession {
  id: string;
  user_id: string;
  mantra_id: string;
  sankalp: string | null;
  target_count: number;
  actual_count: number;
  duration_seconds: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

interface JapTotal {
  id: string;
  user_id: string;
  mantra_id: string;
  total_chants: number;
  total_sessions: number;
  total_malas: number;
  last_session_at: string | null;
  current_streak: number;
  longest_streak: number;
  last_streak_date: string | null;
}
```

### C. Panchang Astro Details
```typescript
interface PanchangData {
  date: string;
  zone: string;
  city: string;
  tithi: string;
  tithi_number: number;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: "Shukla" | "Krishna";
  sunrise: string;
  sunset: string;
  rahu_kaal: string;
  brahma_muhurat: string;
  vara: string; // Somvaar, Mangalvaar, etc.
}
```

---

## 4. Complete Page & Feature Layout Specifications

### 1. Home / Portal Page (`/`)
- **Hero Area**: Divine background, tagline, search bar, and voice search button.
- **Daily Doha Card**: Displays daily verses (Kabir, Tulsidas, or Rahim) in Hindi/English with translation and copying/sharing features.
- **Deity Grid**: Icon list of deities (Ganesha, Shiva, Krishna, Rama, Hanuman, Durga) linking to individual deity page catalogs.
- **Trending & Recent Bhajans**: Infinite horizontal scroll carousels showing album-art bhajan cards with dynamic play toggles.

### 2. Panchang & Astro Temple (`/panchang`)
- **Zone Selector**: Dropdown to toggle regional inputs (North, Northwest, West, Central, Northeast, South).
- **Muhurat Grid**: Floating display of Brahma Muhurat, Rahu Kaal, Abhijit Muhurat, Vijay Muhurat, and Godhuli Muhurat.
- **Shubh/Ashubh Matchmaking Engine**: Input fields to check whether an activity (e.g. traveling, wedding, purchasing assets) matches the day's Nakshatra/Tithi, returning a green check or red alert.
- **Festival Calendar**: Calendar view displaying upcoming Vrats (orange), Parvas (red), and Utsavs (brown) with push notification setting options.

### 3. Mantra Japa Sanctuary (`/meditation`)
- **Mantra Select List**: Detailed grid of mantras showing Hindi text, translation, audio playbacks.
- **Japa Play Mode**:
  - Center: Large Japa counter dial.
  - Sankalpa Banner: Displays current Japa intent (custom/pre-defined).
  - Sound Controls: Toggle offline temple bell, counting audio guides.
  - Round Counter: Displayscompleted Malas (multiples of 108).
- **Streak Panel**: Displays daily calendar with completed days, current streak flame, and milestones list.

### 4. Bhajan Details & Interactive Lyrics (`/bhajan/:slug`)
- **Header**: Back button, deity name, song title, dynamic like count.
- **Video Panel**: Sticky floating YouTube media player or custom audio wave player.
- **Lyrics Display Area**:
  - Toggles: Sanskrit (Devanagari) / Hinglish / English translation.
  - Dynamic Sync: Highlighting lines in real-time as the audio track progresses.

### 5. Raghavam Poster Maker (`/poster-maker`)
- **Template Gallery**: Selection of pre-made backgrounds (Hanumanji Blessings, Radhe Krishna, Khatu Shyam).
- **Draggable Canvas Editor**:
  - Image Upload/Crop tools (circular, square, oval frames).
  - Scaling slider (Zoom 0.5x to 3.0x).
  - Draggable Custom Name Plate: Add name banner on the canvas, positioning it with simple mouse/touch drag interfaces.
- **Action Buttons**:HD Quality export trigger to save directly to local devices.

### 6. Voice-Enabled Devotional Assistant (`🙏 भजन सहायक`)
- **Chat Dialog**: Conversational layout mimicking instant messaging interfaces.
- **Microphone Input Target**: Large, highlighted voice recording action button matching accessibility criteria for elderly users.
- **Text-To-Speech Output**: Integrates native narration tools allowing the user to hear the assistant speak the responses out loud.
- **Quick Queries Prompt Panel**: Short prompt bubbles ("Morning bhajans", "Gita Summary") for rapid navigation.

### 7. Virtual Aarti Simulation
- **Aarti Scene**: Full-screen view of a selected deity surrounded by virtual temple puja items.
- **Puja Actions Panel**:
  - Flower Petal Shower: Clicking drops dynamic flower particles across the screen.
  - Bell Ringing: Swings a brass hanging temple bell with corresponding physics-based audio playback.
  - Incense Smoke: Generates rising transparent incense smoke wisps.
  - Deepa Aarti rotation: Dragging rotates the ghee deepa, creating a rotating divine halo behind the deity's portrait.

### 8. Staff Moderation Hub (`/admin`)
- **Bhajan Upload Workflow**: Complete validation step interface for audio uploads (Cloudinary sync), title localization (Hindi/English validation), and deity tags.
- **Moderator Dashboard**: Table of pending user uploads with action flags (Approve / Reject / Changes Requested). Triggering these sends an automated Resend-API email notification to the user.
- **Audit Logs Table**: System logging of all admin actions (user status updates, bhajan creations).
