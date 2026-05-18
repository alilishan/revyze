# Homepage & Dashboard Redesign — Design Spec

**Date:** 2026-05-18 (finalised after mockup review)  
**Scope:** `app/app/page.tsx` (home page) + `app/app/dashboard/page.tsx` (dashboard)  
**App name:** Revyze (rename throughout — was "IGCSE FlashCards")  
**Goal:** Transform both pages from flat/static to a modern, soft, student-friendly design using pastel subject colours, framer-motion animations, Lucide + Phosphor Duotone icons, and Poppins typography.

**Approved mockups:** `.superpowers/mockups/home-page-v3.html` + `.superpowers/mockups/dashboard-v3.html`

---

## Packages to install

| Package | Command | Purpose |
|---|---|---|
| `framer-motion` | `npm install framer-motion` | Spring physics, stagger, SVG path animation |
| `react-icons` | `npm install react-icons` | Phosphor Duotone subject icons (`Pi` prefix) |

Already installed and used throughout: `lucide-react`, `tw-animate-css`.  
`animate-ui` is **not** needed — framer-motion covers all animation requirements.

---

## Typography

- **Font:** Poppins (Google Fonts) — weights 400 and 500 only. 500 is the maximum weight used anywhere.
- **Root size:** `18px` set on `html` element so all `rem` values scale from it.
- **All font sizes in `rem`** — no `px` values for text.
- Add to `app/app/globals.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');
  html { font-size: 18px; }
  body { font-family: 'Poppins', sans-serif; }
  ```

---

## Colour System

### Page background
`bg-indigo-50` (`#EEF2FF`) — soft indigo tint, used on both pages.

### Subject colour profiles

New file: `app/lib/subject-colors.ts`

| Subject | Code | Card bg | Card border | Top stripe | Icon color | Score hex |
|---|---|---|---|---|---|---|
| Biology | 0610 | `bg-emerald-50` | `border-emerald-200` | `border-t-emerald-500` | `text-emerald-700` | `#059669` |
| Physics | 0625 | `bg-blue-50` | `border-blue-200` | `border-t-blue-500` | `text-blue-700` | `#2563EB` |
| Chemistry | 0620 | `bg-violet-50` | `border-violet-200` | `border-t-violet-500` | `text-violet-700` | `#7C3AED` |
| Maths | 0580 | `bg-orange-50` | `border-orange-200` | `border-t-orange-500` | `text-orange-700` | `#EA580C` |
| English | 0500 | `bg-rose-50` | `border-rose-200` | `border-t-rose-500` | `text-rose-700` | `#BE185D` |
| Computer Science | 0478 | `bg-cyan-50` | `border-cyan-200` | `border-t-cyan-500` | `text-cyan-700` | `#0891B2` |
| History | 0470 | `bg-amber-50` | `border-amber-200` | `border-t-amber-500` | `text-amber-700` | `#D97706` |
| Geography | 0460 | `bg-teal-50` | `border-teal-200` | `border-t-teal-500` | `text-teal-700` | `#0D9488` |
| Default | — | `bg-slate-50` | `border-slate-200` | `border-t-slate-500` | `text-slate-700` | `#475569` |

```ts
type SubjectColorProfile = {
  cardBg: string      // Tailwind bg class — pastel tint card background
  border: string      // Tailwind border class — card border
  topStripe: string   // Tailwind border-top class — coloured top stripe on quiz cards
  iconColor: string   // Tailwind text class — icon and accent colour
  hex: string         // Raw hex — SVG score ring stroke
}
```

### Subject icons (Phosphor Duotone via `react-icons`)

| Subject | Icon |
|---|---|
| Biology | `PiDna` |
| Physics | `PiLightning` |
| Chemistry | `PiFlask` |
| Maths | `PiMathOperations` |
| English | `PiBookOpenText` |
| Computer Science | `PiCode` |
| History | `PiClockCounterClockwise` |
| Geography | `PiGlobeHemisphereWest` |

---

## Server / Client split

Both page files remain **server components** — they fetch data and pass props to client sub-components for animation.

| Component | File | Type | Purpose |
|---|---|---|---|
| `HeroSection` | `app/components/hero-section.tsx` | `'use client'` | Animated hero: stagger headline, live pill, floating card stack, ticker |
| `AnimatedCards` | `app/components/animated-cards.tsx` | `'use client'` | Stagger-entrance wrapper for any list of cards |
| `AnimatedCounter` | `app/components/animated-counter.tsx` | `'use client'` | Counts up from 0 to target on mount (800ms ease-out) |
| `ScoreRing` | `app/components/score-ring.tsx` | `'use client'` | SVG arc that animates `strokeDashoffset` on mount |

---

## Home page (`app/app/page.tsx`)

### Nav
- Sticky, `bg-white shadow-sm border-b border-slate-100`
- Logo: `"REVY"` + `"ZE"` in indigo (`text-indigo-600`) — Poppins 500
- Right: sign-out (if logged in) or ghost + primary CTA buttons
- Primary button: `bg-indigo-600 text-white rounded-xl shadow-md hover:-translate-y-0.5 transition`

### Hero (`HeroSection` client component, full section)
- Background: `bg-indigo-50` (same as page, seamless)
- Layout: two-column grid — left text content, right floating card stack
- **Live pill** (top of left column):
  - Green pulsing dot (`animate-ping`) + `"200+ Biology questions live · more subjects coming soon"`
  - `bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full`
- **Headline:** `"Master your Cambridge IGCSE."` — two lines
  - Line 1 plain ink, Line 2 gradient text: `bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent`
  - Each word is a `motion.span` with `opacity 0→1, y 20→0`, stagger 60ms
- **Subtext:** `motion.p` fades in at 300ms delay
- **CTAs:**
  - Primary: `"Start for free →"` — `bg-indigo-600 shadow-lg shadow-indigo-200`
  - Ghost: `"Sign in"` — `border border-slate-300 bg-white`
- **Floating flashcard stack** (right column):
  - 3 `motion.div` cards stacked with `rotate` + `translate` transforms
  - Each card: white, `rounded-2xl shadow-xl`, subject pill tag + question text + locked divider
  - `animate` with subtle float loop (`y: 0 → -10 → 0`, 5s infinite)
  - Cards: Biology / Physics / Chemistry sample questions
- **Ticker** (below hero, full width):
  - Dark indigo background `bg-indigo-900`
  - Poppins 500, uppercase, indigo-100 text
  - CSS-only marquee animation (`@keyframes ticker`) added to `globals.css`
  - Content duplicated for seamless loop

### Feature section
- 3 white cards on `bg-indigo-50`, `rounded-2xl shadow-sm border border-indigo-100`
- Each: Lucide icon in a coloured rounded container + title + description + large stat
  - `<Library>` in `bg-indigo-100 text-indigo-600` → "8 subjects"
  - `<FileCheck2>` in `bg-emerald-100 text-emerald-600` → "200+ Qs"
  - `<TrendingUp>` in `bg-violet-100 text-violet-600` → "∞ Practice"
- `whileHover={{ y: -3 }}` with `transition={{ type: 'spring', stiffness: 300 }}`

### DB status footer
- One line at the bottom of the page: green/red dot + status message
- `text-xs text-slate-400` — de-emphasised, not student-facing

---

## Dashboard (`app/app/dashboard/page.tsx`)

### Greeting card
- Full-width card: `bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl`
- Left: `PiUserCircle` Phosphor icon in a translucent circle (`bg-white/25 border border-white/40`) + greeting text
  - Icon color matches border: `text-white/40`
  - Icon centered with `flex items-center justify-center`
  - `"Welcome back"` subtitle (white/70), `"Hey, {firstName}!"` heading (white, Poppins 500)
- Right: `"Start Quiz →"` — white button, `text-indigo-600`, `shadow-md`
- Decorative translucent circles (pseudo-elements) for depth

### Stats strip
3 cards in a row, each:
- `bg-white rounded-xl border border-slate-200 shadow-sm`
- Icon in a coloured box (`rounded-xl`):
  - `<Library>` in `bg-indigo-100 text-indigo-600`
  - `<Target>` in `bg-emerald-100 text-emerald-600`
  - `<BarChart2>` in `bg-amber-100 text-amber-600`
- Value: `<AnimatedCounter>` (800ms, ease-out cubic)
- Label: `text-slate-500 text-sm`
- Wrapped in `<AnimatedCards>` for stagger entrance

### Your Quizzes cards
Each `UserQuizCard`:
- `bg-white rounded-xl border border-slate-200 shadow-sm`
- **Coloured top stripe:** `border-t-4` using subject `topStripe` class
- **Subject pill:** small badge using subject `cardBg` + `iconColor` classes
- **Title** in Poppins 500
- **Score ring:** `<ScoreRing size={44} score={attempt.score} hex={colors.hex} />` — SVG arc animates on mount
- **Progress bar:** thin `h-1 rounded-full` bar, subject colour, animates width on mount
- **Meta:** `"18/20 · 4m 32s"` in `text-slate-400 text-xs`
- **Retake button:** ghost outlined, `hover:border-indigo-400 hover:text-indigo-600`
- Wrapped in `<AnimatedCards>` for stagger entrance (50ms apart)
- `whileHover={{ y: -3 }}` spring transition

### Recent Activity
- Each item: `bg-white rounded-xl border border-slate-200 shadow-sm`
- Title + score badge (coloured pill: `bg-emerald-100 text-emerald-800` etc.)
- Mini progress bar (thin, subject colour)
- Subject tag (uppercase, `text-slate-400`) + relative time ("2h ago")
- Relative time computed from `completedAt` using a small helper `formatRelativeTime(date: Date): string`
- Wrapped in `<AnimatedCards>`

### Browse Subjects grid
Each `SubjectCard`:
- Background: subject `cardBg` class, border: subject `border` class
- `rounded-xl shadow-sm`
- Phosphor Duotone icon from the subject icon map, colored with subject `iconColor`
- Subject name (Poppins 500) + card count or "Coming soon" in muted text
- Action buttons (if cards exist): `bg-white/70 border border-slate-200/60` rounded buttons
- `whileHover={{ y: -3 }}` spring
- Wrapped in `<AnimatedCards>` (40ms stagger)

### Empty states
- Lucide icon (`<BookOpen>` or `<Sparkles>`) in a soft indigo circle
- Warm copy + direct CTA button

---

## Animation spec

| Element | Framer-motion config | Duration |
|---|---|---|
| Hero headline words | `initial={{opacity:0, y:20}}` stagger 60ms | 400ms |
| Hero subtext | `initial={{opacity:0, y:10}}` delay 300ms | 400ms |
| Floating flashcard loop | `animate={{y:[0,-10,0]}}` infinite | 5s each |
| Feature card hover | `whileHover={{y:-3}}` spring stiffness 300 | — |
| Stats stagger | `AnimatedCards` 50ms apart | 350ms each |
| AnimatedCounter | JS `requestAnimationFrame`, cubic ease-out | 800ms |
| ScoreRing | `strokeDashoffset` CSS animation on mount | 1000ms ease-out |
| Quiz card hover | `whileHover={{y:-3}}` spring stiffness 400 | — |
| Subject card hover | `whileHover={{y:-3}}` spring stiffness 400 | — |
| Activity stagger | `AnimatedCards` 40ms apart | 350ms each |

`useReducedMotion()` checked in `AnimatedCards` and `HeroSection` — all motion disabled when set.

---

## Ticker animation (CSS-only)

Add to `app/app/globals.css`:
```css
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.animate-ticker {
  animation: ticker 24s linear infinite;
}
```

The ticker inner div contains the subject list duplicated twice for seamless loop.

---

## Relative time helper

New utility: `app/lib/format.ts` — add `formatRelativeTime(date: Date): string`  
Returns "just now", "2h ago", "yesterday", "3 days ago" etc. based on diff from `new Date()`.  
Used in Recent Activity cards.

---

## Files changed

| Action | Path | Notes |
|---|---|---|
| Modify | `app/app/globals.css` | Add Poppins import, `html { font-size: 18px }`, ticker keyframe |
| Create | `app/lib/subject-colors.ts` | Subject code → `SubjectColorProfile` map |
| Modify | `app/lib/format.ts` | Add `formatRelativeTime` |
| Create | `app/components/hero-section.tsx` | `'use client'` — full home page hero |
| Create | `app/components/animated-cards.tsx` | `'use client'` — stagger wrapper |
| Create | `app/components/animated-counter.tsx` | `'use client'` — count-up |
| Create | `app/components/score-ring.tsx` | `'use client'` — SVG arc |
| Modify | `app/app/page.tsx` | Full redesign using new components |
| Modify | `app/app/dashboard/page.tsx` | Full redesign using new components |

---

## Out of scope

- Login / register pages — not touched
- Quiz session page — not touched
- Quiz review page — not touched
- Question bank page — not touched
- Backend / data changes — none
- Dark mode — not in this iteration
