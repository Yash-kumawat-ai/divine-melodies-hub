# Morphing AI Button

Hotstar-style "Ask AI" button with three spring-animated states: idle pill → listening circle → result circle.

## Setup

```bash
npm create vite@latest morphing-ai-button -- --template react-ts
cd morphing-ai-button
npm install framer-motion
npm install -D tailwindcss postcss autoprefixer
```

Copy these files from this folder into your generated project, overwriting the defaults:
- `src/components/MorphingAIButton.tsx`
- `src/index.css`
- `src/App.tsx`
- `tailwind.config.js`
- `postcss.config.js`

Then drop your image into `public/result-image.png` (square image recommended — it gets cropped into a circle).

## Run

```bash
npm run dev
```

Open http://localhost:5173, click the pill → it morphs to a listening circle → auto-morphs to your result image in a glowing circle after 2s. Click the circle or "Reset" to go back to idle.

## Quick customization map

| Want to change | Edit this |
|---|---|
| Colors | gradient classes in each state (`from-blue-600/40` etc.) |
| Idle pill size | `h-14 px-6` |
| Result circle size | `h-40 w-40` |
| Auto-advance timing | `setTimeout(..., 2000)` in the `useEffect` |
| Spring feel | `springTransition` object (`stiffness`/`damping`) |
| Button label | `"Ask AI"` text |
| Waveform bar count | the `[0, 1, 2]` array |
