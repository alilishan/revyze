# Homepage & Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `app/app/page.tsx` (home) and `app/app/dashboard/page.tsx` (dashboard) into a modern, pastel, student-friendly UI with Poppins typography, per-subject colour profiles, framer-motion animations, and Phosphor Duotone icons.

**Architecture:** Pages stay server components; client-side animation is isolated in dedicated `'use client'` components. Subject colour profiles live in a single `lib/subject-colors.ts` lookup so every component reads from one source of truth. Dashboard queries are updated to return `subject.code` so colour profiles can be resolved at render time.

**Tech Stack:** Next.js 16 App Router · Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`) · framer-motion · react-icons (Phosphor Duotone `pi`) · lucide-react (already installed) · Poppins (Google Fonts)

---

## File map

| Action | Path | Notes |
|---|---|---|
| Modify | `app/app/globals.css` | Poppins import, 18px root, ticker + fadeInUp keyframes |
| Create | `app/lib/subject-colors.ts` | Subject code → `SubjectColorProfile` lookup |
| Modify | `app/lib/format.ts` | Add `formatRelativeTime` |
| Modify | `app/lib/dashboard.ts` | Add `code` to subject selects |
| Create | `app/components/animated-counter.tsx` | `'use client'` — count-up with rAF |
| Create | `app/components/score-ring.tsx` | `'use client'` — SVG arc animation |
| Create | `app/components/animated-cards.tsx` | `'use client'` — framer-motion stagger wrapper |
| Create | `app/components/hero-section.tsx` | `'use client'` — full home hero + ticker |
| Create | `app/components/feature-cards.tsx` | `'use client'` — 3 feature cards with hover |
| Create | `app/components/user-quiz-card.tsx` | `'use client'` — quiz card with ScoreRing + hover |
| Create | `app/components/subject-card.tsx` | `'use client'` — subject card with Phosphor icon + hover |
| Modify | `app/app/page.tsx` | Full home redesign |
| Modify | `app/app/dashboard/page.tsx` | Full dashboard redesign |

---

## Task 1: Install packages

**Files:** none (shell commands only)

- [ ] **Step 1: Install framer-motion and react-icons**

Run from `app/`:
```bash
npm install framer-motion react-icons
```
Expected output: `added N packages` with no errors.

- [ ] **Step 2: Verify installations**

```bash
node -e "require('framer-motion'); require('react-icons'); console.log('ok')"
```
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add app/package.json app/package-lock.json
git commit -m "chore: install framer-motion and react-icons"
```

---

## Task 2: Update globals.css

**Files:**
- Modify: `app/app/globals.css`

- [ ] **Step 1: Add Poppins, root font size, and CSS animations at the top of globals.css**

The file starts with `@import "tailwindcss";`. Add these lines immediately after the existing imports, before `@custom-variant dark`:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');

html {
  font-size: 18px;
}

body {
  font-family: 'Poppins', sans-serif;
}

@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@utility animate-ticker {
  animation: ticker 24s linear infinite;
}
```

The full top of the file should read:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');

html {
  font-size: 18px;
}

body {
  font-family: 'Poppins', sans-serif;
}

@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@utility animate-ticker {
  animation: ticker 24s linear infinite;
}

@custom-variant dark (&:is(.dark *));
```

- [ ] **Step 2: Verify dev server still starts without errors**

```bash
cd app && npm run dev
```
Expected: Compiled successfully (Turbopack), no CSS parse errors. Ctrl-C to stop.

- [ ] **Step 3: Commit**

```bash
git add app/app/globals.css
git commit -m "style: add Poppins font, 18px root, ticker and fadeInUp animations"
```

---

## Task 3: Create subject-colors.ts and test

**Files:**
- Create: `app/lib/subject-colors.ts`
- Create: `app/__tests__/lib/subject-colors.test.ts`

- [ ] **Step 1: Write the failing test**

`app/__tests__/lib/subject-colors.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { getSubjectColors } from "@/lib/subject-colors"

describe("getSubjectColors", () => {
  it("returns Biology (emerald) colors for code 0610", () => {
    const c = getSubjectColors("0610")
    expect(c.cardBg).toBe("bg-emerald-50")
    expect(c.border).toBe("border-emerald-200")
    expect(c.topStripe).toBe("border-t-emerald-500")
    expect(c.iconColor).toBe("text-emerald-700")
    expect(c.hex).toBe("#059669")
  })

  it("returns Physics (blue) colors for code 0625", () => {
    const c = getSubjectColors("0625")
    expect(c.cardBg).toBe("bg-blue-50")
    expect(c.hex).toBe("#2563EB")
  })

  it("returns default (slate) colors for an unknown code", () => {
    const c = getSubjectColors("9999")
    expect(c.cardBg).toBe("bg-slate-50")
    expect(c.border).toBe("border-slate-200")
    expect(c.hex).toBe("#475569")
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
cd app && npm test -- subject-colors
```
Expected: FAIL — "Cannot find module '@/lib/subject-colors'"

- [ ] **Step 3: Create subject-colors.ts**

`app/lib/subject-colors.ts`:
```ts
export type SubjectColorProfile = {
  cardBg: string
  border: string
  topStripe: string
  iconColor: string
  hex: string
}

const SUBJECT_COLORS: Record<string, SubjectColorProfile> = {
  "0610": { cardBg: "bg-emerald-50", border: "border-emerald-200", topStripe: "border-t-emerald-500", iconColor: "text-emerald-700", hex: "#059669" },
  "0625": { cardBg: "bg-blue-50",    border: "border-blue-200",    topStripe: "border-t-blue-500",    iconColor: "text-blue-700",    hex: "#2563EB" },
  "0620": { cardBg: "bg-violet-50",  border: "border-violet-200",  topStripe: "border-t-violet-500",  iconColor: "text-violet-700",  hex: "#7C3AED" },
  "0580": { cardBg: "bg-orange-50",  border: "border-orange-200",  topStripe: "border-t-orange-500",  iconColor: "text-orange-700",  hex: "#EA580C" },
  "0500": { cardBg: "bg-rose-50",    border: "border-rose-200",    topStripe: "border-t-rose-500",    iconColor: "text-rose-700",    hex: "#BE185D" },
  "0478": { cardBg: "bg-cyan-50",    border: "border-cyan-200",    topStripe: "border-t-cyan-500",    iconColor: "text-cyan-700",    hex: "#0891B2" },
  "0470": { cardBg: "bg-amber-50",   border: "border-amber-200",   topStripe: "border-t-amber-500",   iconColor: "text-amber-700",   hex: "#D97706" },
  "0460": { cardBg: "bg-teal-50",    border: "border-teal-200",    topStripe: "border-t-teal-500",    iconColor: "text-teal-700",    hex: "#0D9488" },
}

const DEFAULT_COLORS: SubjectColorProfile = {
  cardBg: "bg-slate-50",
  border: "border-slate-200",
  topStripe: "border-t-slate-500",
  iconColor: "text-slate-700",
  hex: "#475569",
}

export function getSubjectColors(code: string): SubjectColorProfile {
  return SUBJECT_COLORS[code] ?? DEFAULT_COLORS
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
cd app && npm test -- subject-colors
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/lib/subject-colors.ts app/__tests__/lib/subject-colors.test.ts
git commit -m "feat: add subject color profiles lookup"
```

---

## Task 4: Add formatRelativeTime to format.ts

**Files:**
- Modify: `app/lib/format.ts`
- Modify: `app/__tests__/lib/format.test.ts`

- [ ] **Step 1: Write the failing tests (add to existing format.test.ts)**

Add these tests to `app/__tests__/lib/format.test.ts` after the existing `formatDuration` suite:

```ts
import { formatDuration, formatRelativeTime } from "@/lib/format"

// ... existing formatDuration tests stay unchanged ...

describe("formatRelativeTime", () => {
  it("returns 'just now' for dates within 60 seconds", () => {
    expect(formatRelativeTime(new Date(Date.now() - 30_000))).toBe("just now")
    expect(formatRelativeTime(new Date(Date.now() - 0))).toBe("just now")
  })

  it("returns minutes for sub-hour dates", () => {
    expect(formatRelativeTime(new Date(Date.now() - 5 * 60_000))).toBe("5m ago")
    expect(formatRelativeTime(new Date(Date.now() - 59 * 60_000))).toBe("59m ago")
  })

  it("returns hours for sub-day dates", () => {
    expect(formatRelativeTime(new Date(Date.now() - 3 * 3_600_000))).toBe("3h ago")
    expect(formatRelativeTime(new Date(Date.now() - 23 * 3_600_000))).toBe("23h ago")
  })

  it("returns 'yesterday' for dates 24-47 hours ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 25 * 3_600_000))).toBe("yesterday")
  })

  it("returns days for dates 2+ days ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 3 * 86_400_000))).toBe("3 days ago")
  })
})
```

**Note:** Update the import line at the top of `format.test.ts` from:
```ts
import { formatDuration } from "@/lib/format"
```
to:
```ts
import { formatDuration, formatRelativeTime } from "@/lib/format"
```

- [ ] **Step 2: Run tests — expect failure on new tests**

```bash
cd app && npm test -- format
```
Expected: existing tests PASS, `formatRelativeTime` tests FAIL — "formatRelativeTime is not a function"

- [ ] **Step 3: Add formatRelativeTime to format.ts**

Append to `app/lib/format.ts` (keep existing `formatDuration` unchanged):
```ts
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr  = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr  / 24)

  if (diffSec < 60)  return "just now"
  if (diffMin < 60)  return `${diffMin}m ago`
  if (diffHr  < 24)  return `${diffHr}h ago`
  if (diffDay === 1) return "yesterday"
  return `${diffDay} days ago`
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
cd app && npm test -- format
```
Expected: PASS (all tests including new ones)

- [ ] **Step 5: Commit**

```bash
git add app/lib/format.ts app/__tests__/lib/format.test.ts
git commit -m "feat: add formatRelativeTime utility"
```

---

## Task 5: Update dashboard.ts to include subject code

**Files:**
- Modify: `app/lib/dashboard.ts`

The `userQuizzes` and `recentAttempts` queries only select `{ id: true, name: true }` for `subject`. The colour lookup requires `code`. Add it to both selects.

- [ ] **Step 1: Update the subject select in userQuizzes query**

In `getDashboardData`, find:
```ts
subject: { select: { id: true, name: true } },
```
(inside the `userQuizzes` `prisma.quizAttempt.findMany` call)

Change to:
```ts
subject: { select: { id: true, name: true, code: true } },
```

- [ ] **Step 2: Update the subject select in recentAttempts query**

Find:
```ts
subject: { select: { name: true } },
```
(inside the `recentAttempts` `prisma.quizAttempt.findMany` call)

Change to:
```ts
subject: { select: { name: true, code: true } },
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/lib/dashboard.ts
git commit -m "feat: include subject code in dashboard queries for colour lookup"
```

---

## Task 6: Create animated-counter.tsx

**Files:**
- Create: `app/components/animated-counter.tsx`

- [ ] **Step 1: Create the component**

`app/components/animated-counter.tsx`:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

type Props = {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, suffix = '', duration = 800, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!ref.current) return
    if (prefersReduced) {
      ref.current.textContent = `${value}${suffix}`
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      if (ref.current) {
        ref.current.textContent = `${Math.round(eased * value)}${suffix}`
      }
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, suffix, duration, prefersReduced])

  return (
    <span ref={ref} className={className}>
      {value}{suffix}
    </span>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/animated-counter.tsx
git commit -m "feat: add AnimatedCounter component"
```

---

## Task 7: Create score-ring.tsx

**Files:**
- Create: `app/components/score-ring.tsx`

- [ ] **Step 1: Create the component**

`app/components/score-ring.tsx`:
```tsx
'use client'

import { useEffect, useRef } from 'react'

const RADIUS = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 87.96

type Props = {
  score: number // 0–100
  hex: string
  size?: number
}

export function ScoreRing({ score, hex, size = 44 }: Props) {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!circleRef.current) return
    const target = CIRCUMFERENCE * (1 - score / 100)
    // Animate via transition after mount — offset starts at full (hidden), animates to target
    requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 1000ms ease-out'
        circleRef.current.style.strokeDashoffset = String(target)
      }
    })
  }, [score])

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label={`Score: ${score}%`}>
      {/* Track */}
      <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="4" />
      {/* Fill arc — starts fully hidden (offset = CIRCUMFERENCE), animates to target */}
      <circle
        ref={circleRef}
        cx="18"
        cy="18"
        r={RADIUS}
        fill="none"
        stroke={hex}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE}
        transform="rotate(-90 18 18)"
      />
      {/* Score label */}
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontSize="8"
        fontWeight="500"
        fill={hex}
        fontFamily="Poppins, sans-serif"
      >
        {score}%
      </text>
    </svg>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/score-ring.tsx
git commit -m "feat: add ScoreRing SVG animation component"
```

---

## Task 8: Create animated-cards.tsx

**Files:**
- Create: `app/components/animated-cards.tsx`

- [ ] **Step 1: Create the component**

`app/components/animated-cards.tsx`:
```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import React, { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  staggerMs?: number
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: (staggerSec: number) => ({
    transition: { staggerChildren: staggerSec },
  }),
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function AnimatedCards({ children, staggerMs = 50, className }: Props) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      custom={staggerMs / 1000}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/animated-cards.tsx
git commit -m "feat: add AnimatedCards stagger wrapper"
```

---

## Task 9: Create hero-section.tsx

**Files:**
- Create: `app/components/hero-section.tsx`

- [ ] **Step 1: Create the component**

`app/components/hero-section.tsx`:
```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

const HEADLINE_WORDS = ["Master", "your", "Cambridge", "IGCSE."]

const TICKER_ITEMS = [
  "Biology", "Physics", "Chemistry", "Mathematics",
  "English", "Computer Science", "History", "Geography",
]

const SAMPLE_CARDS = [
  {
    subject: "Biology",
    pillClass: "bg-emerald-100 text-emerald-700",
    question: "Describe the process of osmosis in plant cells.",
    rotate: -5,
    x: -16,
    yBase: 16,
  },
  {
    subject: "Physics",
    pillClass: "bg-blue-100 text-blue-700",
    question: "State Newton's second law of motion.",
    rotate: 3,
    x: 8,
    yBase: -8,
  },
  {
    subject: "Chemistry",
    pillClass: "bg-violet-100 text-violet-700",
    question: "What is the role of a catalyst in a chemical reaction?",
    rotate: 0,
    x: 0,
    yBase: 0,
  },
]

type Props = {
  isLoggedIn: boolean
}

export function HeroSection({ isLoggedIn }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <>
      {/* ── Hero section ──────────────────────────────────────────────── */}
      <section className="bg-indigo-50">
        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text content */}
          <div className="space-y-6">

            {/* Live pill */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full px-4 py-1.5 text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              200+ Biology questions live · more subjects coming soon
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl leading-tight font-medium">
              {HEADLINE_WORDS.map((word, i) => {
                const isLast = i === HEADLINE_WORDS.length - 1
                if (prefersReduced) {
                  return (
                    <span
                      key={word}
                      className={`inline-block mr-[0.3em] ${isLast ? "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" : "text-slate-900"}`}
                    >
                      {word}
                    </span>
                  )
                }
                return (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                    className={`inline-block mr-[0.3em] ${isLast ? "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" : "text-slate-900"}`}
                  >
                    {word}
                  </motion.span>
                )
              })}
            </h1>

            {/* Subtext */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-slate-500 text-base max-w-xs leading-relaxed"
            >
              Flashcards and quizzes built from real Cambridge past papers — every topic, every year.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="inline-flex items-center bg-indigo-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-transform"
              >
                Start for free →
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="inline-flex items-center border border-slate-300 bg-white text-slate-700 rounded-xl px-5 py-2.5 text-sm font-medium hover:-translate-y-0.5 transition-transform"
                >
                  Sign in
                </Link>
              )}
            </motion.div>
          </div>

          {/* Right: floating flashcard stack */}
          <div className="relative h-72 hidden lg:flex items-center justify-center">
            {SAMPLE_CARDS.map((card, i) => (
              <motion.div
                key={card.subject}
                className="absolute w-64 bg-white rounded-2xl shadow-xl p-5"
                style={{ rotate: card.rotate, x: card.x, zIndex: SAMPLE_CARDS.length - i }}
                animate={prefersReduced ? {} : {
                  y: [card.yBase, card.yBase - 10, card.yBase],
                }}
                transition={{
                  duration: 5,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${card.pillClass}`}>
                  {card.subject}
                </span>
                <p className="text-slate-700 mt-3 text-sm leading-relaxed">
                  {card.question}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="h-2 bg-slate-100 rounded-full flex-1" />
                  <div className="h-2 w-10 bg-slate-200 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Ticker ────────────────────────────────────────────────────── */}
      <div className="bg-indigo-900 overflow-hidden py-3">
        <div className="animate-ticker inline-flex gap-16 whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-indigo-200 text-xs font-medium uppercase tracking-widest"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/hero-section.tsx
git commit -m "feat: add HeroSection client component with animated headline and ticker"
```

---

## Task 10: Create feature-cards.tsx

**Files:**
- Create: `app/components/feature-cards.tsx`

- [ ] **Step 1: Create the component**

`app/components/feature-cards.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import { Library, FileCheck2, TrendingUp } from 'lucide-react'

const FEATURES = [
  {
    icon: Library,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    stat: '8 subjects',
    title: 'Full curriculum',
    description: 'Covers the complete Cambridge IGCSE curriculum — Sciences, Maths, Humanities, and Languages.',
  },
  {
    icon: FileCheck2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    stat: '200+ Qs',
    title: 'Past-paper questions',
    description: 'Every flashcard is derived from real past papers with cross-year frequency analysis.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    stat: '∞ Practice',
    title: 'Track progress',
    description: 'Score history, time-per-quiz, and per-question breakdowns stored for every student.',
  },
]

export function FeatureCards() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {FEATURES.map((f) => {
        const Icon = f.icon
        return (
          <motion.div
            key={f.title}
            className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 flex flex-col gap-3"
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={`${f.iconBg} ${f.iconColor} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-medium text-slate-900">{f.stat}</p>
            <div>
              <h3 className="font-medium text-slate-900 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.description}</p>
            </div>
          </motion.div>
        )
      })}
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/feature-cards.tsx
git commit -m "feat: add FeatureCards client component"
```

---

## Task 11: Create user-quiz-card.tsx

**Files:**
- Create: `app/components/user-quiz-card.tsx`

- [ ] **Step 1: Create the component**

`app/components/user-quiz-card.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import { ScoreRing } from '@/components/score-ring'
import { getSubjectColors } from '@/lib/subject-colors'
import { formatDuration } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Props = {
  attempt: {
    id: string
    score: number
    correctAnswers: number
    totalQuestions: number
    durationSeconds: number
    completedAt: Date | string | null
    quiz: {
      title: string
      subject: {
        id: string
        name: string
        code: string
      }
    }
  }
}

export function UserQuizCard({ attempt }: Props) {
  const colors = getSubjectColors(attempt.quiz.subject.code)

  return (
    <motion.div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 ${colors.topStripe} p-4 flex flex-col gap-3`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Link href={`/dashboard/quiz/${attempt.id}/review`} className="block">
        {/* Subject pill */}
        <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${colors.cardBg} ${colors.iconColor}`}>
          {attempt.quiz.subject.name}
        </span>

        <p className="font-medium text-slate-900 mt-2 line-clamp-1 text-sm">
          {attempt.quiz.title}
        </p>

        <div className="flex items-center gap-3 mt-3">
          <ScoreRing score={attempt.score} hex={colors.hex} size={44} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">
              {attempt.correctAnswers}/{attempt.totalQuestions} · {formatDuration(attempt.durationSeconds)}
            </p>
            {/* Animated progress bar */}
            <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: colors.hex }}
                initial={{ width: 0 }}
                animate={{ width: `${attempt.score}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 mt-auto">
        <Link
          href={`/dashboard/quiz/start?subjectId=${attempt.quiz.subject.id}`}
          className={cn(
            buttonVariants({ size: 'sm', variant: 'outline' }),
            'flex-1 hover:border-indigo-400 hover:text-indigo-600'
          )}
        >
          Retake
        </Link>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/user-quiz-card.tsx
git commit -m "feat: add UserQuizCard with ScoreRing and progress bar"
```

---

## Task 12: Create subject-card.tsx

**Files:**
- Create: `app/components/subject-card.tsx`

- [ ] **Step 1: Create the component**

`app/components/subject-card.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import {
  PiDna,
  PiLightning,
  PiFlask,
  PiMathOperations,
  PiBookOpenText,
  PiCode,
  PiClockCounterClockwise,
  PiGlobeHemisphereWest,
} from 'react-icons/pi'
import { getSubjectColors } from '@/lib/subject-colors'
import { nameToSlug } from '@/lib/subject-slug'
import Link from 'next/link'
import type { IconType } from 'react-icons'

const SUBJECT_ICONS: Record<string, IconType> = {
  "0610": PiDna,
  "0625": PiLightning,
  "0620": PiFlask,
  "0580": PiMathOperations,
  "0500": PiBookOpenText,
  "0478": PiCode,
  "0470": PiClockCounterClockwise,
  "0460": PiGlobeHemisphereWest,
}

type Props = {
  subject: {
    id: string
    name: string
    code: string
    _count: { flashcards: number }
  }
}

export function SubjectCard({ subject }: Props) {
  const colors = getSubjectColors(subject.code)
  const Icon = SUBJECT_ICONS[subject.code] ?? PiBookOpenText
  const hasCards = subject._count.flashcards > 0

  return (
    <motion.div
      className={`${colors.cardBg} border ${colors.border} rounded-xl shadow-sm p-4 flex flex-col gap-3`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div>
        <Icon className={`text-2xl ${colors.iconColor}`} />
        <p className={`font-medium text-sm mt-2 text-slate-900`}>
          {subject.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hasCards ? `${subject._count.flashcards} cards` : "Coming soon"}
        </p>
      </div>

      {hasCards && (
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/dashboard/${nameToSlug(subject.name)}/questions`}
            className="flex-1 text-center text-xs font-medium text-slate-600 bg-white/70 hover:bg-white border border-slate-200/60 rounded-lg py-1.5 transition-colors"
          >
            Questions
          </Link>
          <Link
            href="/dashboard/quiz/start"
            className="flex-1 text-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition-colors"
          >
            Quiz →
          </Link>
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/subject-card.tsx
git commit -m "feat: add SubjectCard with Phosphor Duotone icon and hover"
```

---

## Task 13: Rewrite app/app/page.tsx

**Files:**
- Modify: `app/app/page.tsx`

- [ ] **Step 1: Replace the entire file**

`app/app/page.tsx`:
```tsx
import { auth } from "@/auth"
import { checkDbConnection } from "@/actions/db-health"
import { handleSignOut } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import Link from "next/link"

export default async function HomePage() {
  const [session, dbStatus] = await Promise.all([
    auth(),
    checkDbConnection(),
  ])

  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen bg-indigo-50">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-medium text-lg tracking-tight">
            <span className="text-slate-900">REVY</span>
            <span className="text-indigo-600">ZE</span>
          </span>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-500 hover:text-slate-700 hidden sm:block"
                >
                  Dashboard
                </Link>
                <form action={handleSignOut}>
                  <Button variant="outline" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 border border-slate-300 bg-white rounded-xl px-4 py-1.5 hover:-translate-y-0.5 transition-transform"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm text-white bg-indigo-600 rounded-xl px-4 py-1.5 shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-transform"
                >
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero + Ticker (client component) ─────────────────────────── */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* ── Feature cards (client component) ─────────────────────────── */}
      <FeatureCards />

      {/* ── DB status (de-emphasised, not student-facing) ─────────────── */}
      <footer className="max-w-5xl mx-auto px-4 pb-8 flex items-center gap-1.5">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            dbStatus.connected ? "bg-emerald-400" : "bg-red-400"
          }`}
        />
        <span className="text-xs text-slate-400">
          {dbStatus.connected ? "Database connected" : "Database unavailable"}
        </span>
      </footer>

    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Start dev server and check home page in browser**

```bash
cd app && npm run dev
```
Open http://localhost:3000. Verify:
- "REVYZE" wordmark in nav (slate + indigo)
- Live green pill visible
- Headline words animate in with stagger
- "Cambridge IGCSE." has gradient text (indigo → violet)
- Floating card stack visible on large screen (hidden on mobile)
- Ticker bar scrolls subjects
- 3 feature cards with icons and stats
- Tiny DB status dot at footer

- [ ] **Step 4: Commit**

```bash
git add app/app/page.tsx
git commit -m "feat: redesign home page with Revyze branding and animated hero"
```

---

## Task 14: Rewrite app/app/dashboard/page.tsx

**Files:**
- Modify: `app/app/dashboard/page.tsx`

- [ ] **Step 1: Replace the entire file**

`app/app/dashboard/page.tsx`:
```tsx
import { auth } from "@/auth"
import { getDashboardData, QUIZ_PAGE_SIZE } from "@/lib/dashboard"
import { formatDuration, formatRelativeTime } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatedCards } from "@/components/animated-cards"
import { AnimatedCounter } from "@/components/animated-counter"
import { UserQuizCard } from "@/components/user-quiz-card"
import { SubjectCard } from "@/components/subject-card"
import { getSubjectColors } from "@/lib/subject-colors"
import { Library, Target, BarChart2, BookOpen } from "lucide-react"
import { PiUserCircle } from "react-icons/pi"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — Revyze",
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
type Attempt = DashboardData["recentAttempts"][number]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const { userQuizzes, totalQuizzes, recentAttempts, subjects, stats } =
    await getDashboardData(session.user.id, page)

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / QUIZ_PAGE_SIZE))
  const firstName = session.user.name?.split(" ")[0] ?? "there"
  const totalAttempts = stats._count.id
  const avgScore = stats._avg.score !== null ? Math.round(stats._avg.score) : null

  return (
    <main className="min-h-screen bg-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Greeting card ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl p-6 flex items-center justify-between gap-4">
          {/* Decorative translucent circles */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/5 rounded-full translate-y-12 pointer-events-none" />

          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/25 border border-white/40 flex items-center justify-center shrink-0">
              <PiUserCircle className="text-2xl text-white/40" />
            </div>
            <div>
              <p className="text-white/70 text-xs">Welcome back</p>
              <h1 className="text-white font-medium text-xl">Hey, {firstName}!</h1>
            </div>
          </div>

          <Link
            href="/dashboard/quiz/start"
            className="relative bg-white text-indigo-600 rounded-xl px-4 py-2 text-sm font-medium shadow-md hover:-translate-y-0.5 transition-transform shrink-0"
          >
            Start Quiz →
          </Link>
        </section>

        {/* ── Stats strip ────────────────────────────────────────────── */}
        <AnimatedCards className="grid grid-cols-3 gap-4" staggerMs={50}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 text-indigo-600 rounded-xl p-2 shrink-0">
                <Library className="w-4 h-4" />
              </div>
              <div>
                <AnimatedCounter value={subjects.length} className="text-2xl font-medium text-slate-900" />
                <p className="text-slate-500 text-xs">Subjects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 rounded-xl p-2 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <AnimatedCounter value={totalAttempts} className="text-2xl font-medium text-slate-900" />
                <p className="text-slate-500 text-xs">Quizzes taken</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 text-amber-600 rounded-xl p-2 shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                {avgScore !== null ? (
                  <AnimatedCounter value={avgScore} suffix="%" className="text-2xl font-medium text-slate-900" />
                ) : (
                  <span className="text-2xl font-medium text-slate-900">—</span>
                )}
                <p className="text-slate-500 text-xs">Avg score</p>
              </div>
            </div>
          </div>
        </AnimatedCards>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Your Quizzes — 2/3 width */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-slate-800">Your Quizzes</h2>
              <Link href="/dashboard/quiz/start" className="text-xs text-slate-400 hover:text-slate-600">
                + New quiz
              </Link>
            </div>

            {userQuizzes.length === 0 && page === 1 ? (
              <EmptyState message="No quizzes yet — hit 'Start Quiz' to begin!" />
            ) : (
              <>
                <AnimatedCards className="grid grid-cols-1 sm:grid-cols-2 gap-3" staggerMs={50}>
                  {userQuizzes.map((attempt) => (
                    <UserQuizCard key={attempt.id} attempt={attempt} />
                  ))}
                </AnimatedCards>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/dashboard?page=${page - 1}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        page <= 1 && "pointer-events-none opacity-40",
                      )}
                      aria-disabled={page <= 1}
                    >
                      ← Prev
                    </Link>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <Link
                      href={`/dashboard?page=${page + 1}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        page >= totalPages && "pointer-events-none opacity-40",
                      )}
                      aria-disabled={page >= totalPages}
                    >
                      Next →
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Recent Activity — 1/3 width */}
          <section className="space-y-4">
            <h2 className="text-base font-medium text-slate-800">Recent Activity</h2>
            {recentAttempts.length === 0 ? (
              <EmptyState message="No attempts yet. Take your first quiz!" />
            ) : (
              <AnimatedCards className="space-y-2" staggerMs={40}>
                {recentAttempts.map((attempt) => (
                  <AttemptCard key={attempt.id} attempt={attempt} />
                ))}
              </AnimatedCards>
            )}
          </section>
        </div>

        {/* ── Browse Subjects ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-base font-medium text-slate-800">Browse Subjects</h2>
          <AnimatedCards className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" staggerMs={40}>
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </AnimatedCards>
        </section>

      </div>
    </main>
  )
}

// ── Server-rendered sub-components ───────────────────────────────────────────

function AttemptCard({ attempt }: { attempt: Attempt }) {
  const colors = getSubjectColors(attempt.quiz.subject.code)
  const score = attempt.score

  const scoreBadgeClass =
    score >= 80 ? "bg-emerald-100 text-emerald-800"
    : score >= 60 ? "bg-blue-100 text-blue-800"
    : score >= 40 ? "bg-amber-100 text-amber-800"
    : "bg-red-100 text-red-800"

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900 line-clamp-1 flex-1">
          {attempt.quiz.title}
        </p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${scoreBadgeClass}`}>
          {score}%
        </span>
      </div>
      {/* Mini progress bar */}
      <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: colors.hex }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          {attempt.quiz.subject.name}
        </span>
        {attempt.completedAt && (
          <span className="text-xs text-slate-400">
            {formatRelativeTime(new Date(attempt.completedAt))}
          </span>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <BookOpen className="w-5 h-5 text-indigo-400" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
      <Link
        href="/dashboard/quiz/start"
        className="inline-block mt-3 text-xs text-indigo-600 hover:underline"
      >
        Start a quiz →
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Start dev server and verify the dashboard**

```bash
cd app && npm run dev
```
Sign in and open http://localhost:3000/dashboard. Verify:
- Indigo/violet gradient greeting card with user name and "Start Quiz →"
- Stats strip: 3 cards with icons, numbers count up from 0
- Quiz cards: coloured top stripe, subject pill, ScoreRing animates, progress bar fills, retake button with hover
- Recent activity: score badge, mini progress bar, relative time ("2h ago" etc.)
- Browse Subjects: pastel card per subject with Phosphor Duotone icon, hover lifts card
- Page background is `bg-indigo-50`
- Poppins font throughout, no text over font-weight 500

- [ ] **Step 4: Run all tests**

```bash
cd app && npm test
```
Expected: all tests pass

- [ ] **Step 5: Final commit**

```bash
git add app/app/dashboard/page.tsx app/components/user-quiz-card.tsx app/components/subject-card.tsx
git commit -m "feat: redesign dashboard with pastel subject colours, score rings, and animations"
```
