# Homepage & Dashboard Redesign — Design Spec

**Date:** 2026-05-18  
**Scope:** `app/app/page.tsx` (home page) + `app/app/dashboard/page.tsx` (dashboard)  
**Goal:** Transform both pages from flat/static to modern, animated, and student-appealing — using subject-specific colors, framer-motion animations, and better iconography.

---

## Packages

| Package | How installed | Purpose |
|---|---|---|
| `framer-motion` | `npm install framer-motion` | Spring physics, stagger, layout animations, SVG path |
| `react-icons` | `npm install react-icons` | Subject-specific icons (atom, DNA, calculator, etc.) |
| `animate-ui` | `npx animate-ui@latest add <component>` | Animated UI primitives (shadcn-style registry). Specific components added during implementation: `text-effect` (stagger headline), `number-flow` (counter alternative) |

`lucide-react` and `tw-animate-css` are already installed and will be used throughout.

---

## Color System

New file: `app/lib/subject-colors.ts`

Maps subject codes to a color profile used on both pages:

| Subject | Code | Tailwind gradient | Text | Icon bg |
|---|---|---|---|---|
| Biology | 0610 | `from-emerald-500 to-emerald-700` | `text-emerald-600` | `bg-emerald-100` |
| Physics | 0625 | `from-blue-500 to-blue-700` | `text-blue-600` | `bg-blue-100` |
| Chemistry | 0620 | `from-violet-500 to-violet-700` | `text-violet-600` | `bg-violet-100` |
| Maths | 0580 | `from-orange-500 to-orange-700` | `text-orange-600` | `bg-orange-100` |
| English | 0500 | `from-rose-500 to-rose-700` | `text-rose-600` | `bg-rose-100` |
| Computer Science | 0478 | `from-cyan-500 to-cyan-700` | `text-cyan-600` | `bg-cyan-100` |
| History | 0470 | `from-amber-500 to-amber-700` | `text-amber-600` | `bg-amber-100` |
| Geography | 0460 | `from-teal-500 to-teal-700` | `text-teal-600` | `bg-teal-100` |
| Default | — | `from-slate-500 to-slate-700` | `text-slate-600` | `bg-slate-100` |

The profile shape:
```ts
type SubjectColorProfile = {
  gradient: string      // Tailwind gradient classes for card backgrounds
  text: string          // Tailwind text class for scores/accents
  iconBg: string        // Tailwind bg class for icon containers
  border: string        // Tailwind border class for card top-border accent
  hex: string           // Raw hex for inline SVG (score ring stroke)
}
```

---

## Server / Client Split

Both page files remain **server components** — they fetch data and pass props down. Animated sections are extracted into `'use client'` sub-components:

| Component | File | Purpose |
|---|---|---|
| `AnimatedCounter` | `app/components/animated-counter.tsx` | Counts up from 0 to a target number on mount |
| `AnimatedCards` | `app/components/animated-cards.tsx` | Wraps children in a stagger container |
| `ScoreRing` | `app/components/score-ring.tsx` | SVG arc that animates its stroke-dashoffset on mount |
| `HeroSection` | `app/components/hero-section.tsx` | Animated home page hero (gradient bg, stagger headline, subject chips) |

---

## Home Page (`app/app/page.tsx`)

### Nav
- Sticky, `backdrop-blur-md`, semi-transparent white (`bg-white/80`), subtle bottom border
- Logo: small gradient icon square (indigo→violet) + bold "IGCSE FlashCards" text
- Right: email (hidden on mobile) + sign-out or sign-in button
- Sign-in button: indigo fill with shimmer on hover

### Hero (`HeroSection` client component)
- Full-width dark gradient background: `bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950`
- Headline: `"Ace your IGCSEs."` — each word is a separate `motion.span` that fades up with stagger (60ms between words)
- Subtext: single `motion.p` fades in 300ms after last word
- CTAs:
  - Primary: indigo filled button with a subtle `animate-pulse` glow ring behind it
  - Secondary: glass-style outline button (`bg-white/10 border-white/20 text-white`)
- Subject chips row: horizontal scrollable row of pill badges (Biology, Physics, Chemistry…) — each chip slides up with stagger, 40ms apart. Each chip uses its subject color.

### Feature Cards
- Three glassmorphism cards: `bg-white/10 backdrop-blur border border-white/20 text-white`
- Each card has:
  - A lucide icon in a rounded `bg-white/15` container
  - Bold title + body text
  - `whileHover={{ y: -4 }}` + brighter border transition
- Icons: `<BookOpen>` (Multiple subjects), `<TrendingUp>` (Progress tracking), `<Timer>` (Timed quizzes)

### DB Status
- Moved to bottom of page as a small single-line footer row
- `text-xs text-slate-500` — not student-facing, should not be prominent
- Green/red dot indicator retained, but the whole element is visually de-emphasised

---

## Dashboard (`app/app/dashboard/page.tsx`)

### Greeting
- Headline: `"Hey {firstName}!"` — first name rendered in gradient text clip (`bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent`)
- Subtitle unchanged in copy, but warmer styling
- "Start Quiz →" button: indigo fill, `<ArrowRight>` lucide icon, `whileHover={{ x: 2 }}` on the arrow

### Stats Strip
Three `StatCard` components, each with:
- A lucide icon in a colored rounded container:
  - Subjects → `<BookOpen>` in indigo
  - Quizzes taken → `<Target>` in emerald
  - Avg score → `<TrendingUp>` in amber
- Value rendered via `<AnimatedCounter>` (counts up from 0 on mount, 800ms duration)
- A 3px left-border accent matching the icon color
- Light colored bg tint (`bg-indigo-50`, `bg-emerald-50`, `bg-amber-50`)

### Your Quizzes Cards
Each `UserQuizCard`:
- Subject-colored top border (3px, `border-t-4`) using the subject's color profile
- Score rendered as `<ScoreRing>` — a small (48px) SVG arc that fills in on mount, colored by performance tier
- Subject name as a small colored pill badge (subject color)
- Card wrapper: `whileHover={{ y: -2, boxShadow: "..." }}`
- All cards wrapped in `<AnimatedCards>` for stagger entrance

### Browse Subjects Grid
Each `SubjectCard`:
- Full gradient background using subject color profile (`bg-gradient-to-br`)
- Subject icon from `react-icons` in white (e.g. `GiDna2` for Biology, `IoAtom` for Physics, `GiChemicalDrop` for Chemistry, `TbMath` for Maths)
- White text throughout
- Card count badge: white pill, bottom-right
- Buttons: semi-transparent white (`bg-white/20 hover:bg-white/30`)
- `whileHover={{ scale: 1.03 }}` + deeper shadow
- All cards wrapped in `<AnimatedCards>` for stagger entrance (40ms apart)

### Recent Activity
- Left-side thin bar (3px, subject color) instead of plain border
- Score shown as a colored pill badge (emerald ≥80, blue ≥60, amber ≥40, red <40)
- Timestamp: relative ("2h ago", "yesterday") computed from `completedAt`
- `<AnimatedCards>` stagger entrance

### Empty States
- Icon (`<BookOpen>` or `<Sparkles>`) in a colored circle
- Warmer copy
- Direct CTA button (e.g. "Start your first quiz →") instead of plain text

---

## Animation Spec

| Element | Animation | Duration |
|---|---|---|
| Hero headline words | `opacity: 0→1, y: 20→0` stagger 60ms | 400ms each |
| Hero subtext | `opacity: 0→1, y: 10→0` after 300ms delay | 400ms |
| Subject chips | `opacity: 0→1, y: 15→0` stagger 40ms | 300ms each |
| Feature card hover | `y: 0→-4` | spring (stiffness 300) |
| AnimatedCounter | Linear count 0→value | 800ms |
| ScoreRing stroke | `strokeDashoffset` animate on mount | 1000ms ease-out |
| Dashboard cards (stagger) | `opacity: 0→1, y: 20→0` stagger 50ms | 350ms each |
| Subject card hover | `scale: 1→1.03` | spring (stiffness 400) |
| Quiz card hover | `y: 0→-2` | spring (stiffness 400) |

All `framer-motion` animations respect `prefers-reduced-motion` via the `useReducedMotion` hook — when set, animations are skipped.

---

## Files Changed

| Action | Path | Notes |
|---|---|---|
| Create | `app/lib/subject-colors.ts` | Subject code → color profile map |
| Create | `app/components/animated-counter.tsx` | Client component, framer-motion |
| Create | `app/components/animated-cards.tsx` | Client stagger wrapper |
| Create | `app/components/score-ring.tsx` | SVG arc, client component |
| Create | `app/components/hero-section.tsx` | Full hero, client component |
| Modify | `app/app/page.tsx` | Restructure using new components |
| Modify | `app/app/dashboard/page.tsx` | Restructure using new components |

---

## Out of Scope

- Login / register pages — not touched
- Quiz session page — not touched
- Quiz review page — not touched
- Any backend / data changes
- Dark mode — not in scope for this iteration
