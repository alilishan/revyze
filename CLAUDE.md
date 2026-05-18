# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Revyze** — a multi-user flashcard and quiz platform for Cambridge IGCSE students.
The Next.js 16 app lives inside `app/`. Run all dev commands from there (`cd app`).
Brand name is "Revyze" (wordmark: REVY in slate-900, ZE in indigo-600). Do not use "IGCSE FlashCards".

## Commands

All commands run from `app/`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server on http://localhost:3000 (Turbopack by default in Next.js 16) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest unit tests (once) |
| `npm run test:watch` | Vitest in watch mode |
| `npx prisma migrate dev` | Apply schema changes to local DB |
| `npx prisma db seed` | Seed IGCSE subjects |
| `npx prisma studio` | Open Prisma Studio on http://localhost:5555 |
| `npx prisma generate` | Regenerate Prisma client after schema changes |

## Environment

Copy `app/.env.example` to `app/.env.local` and fill in:
- `DATABASE_URL` — MySQL connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `AUTH_URL` — `http://localhost:3000` in dev
- `RESEND_API_KEY` — from https://resend.com
- `RESEND_FROM_EMAIL` — verified sender address in Resend

## Stack

- **Next.js 16** App Router, React 19, TypeScript
- **Tailwind CSS v4** — CSS-first config via `@import "tailwindcss"` in `globals.css`, no `tailwind.config.ts`
- **shadcn/ui v4** — uses `@base-ui/react` (not Radix UI); no `asChild` prop. Use `buttonVariants()` on `<Link>` for link-styled buttons
- **Auth.js v5** (`next-auth@beta`) — magic link via Resend, Prisma adapter, database sessions
- **Prisma 6** — `prisma.config.ts` handles datasource + seed config; `prisma.config.ts` overrides `package.json#prisma`
- **MySQL** via `mysql2`
- **framer-motion** — animations. Use `layoutId` for shared-layout transitions, `motion` components, `useReducedMotion()` for accessibility.
- **react-icons/pi** — Phosphor Duotone icons (`PiLeaf`, `PiBrain`, etc.). **Never use emoji as UI elements** — always use icons from this package or Lucide.

## Architecture

- **`app/app/`** — App Router. All pages are server components by default; add `'use client'` only where interactivity is needed.
- **`app/actions/`** — Server actions.
  - `auth.ts` — sign-in / sign-out
  - `quiz.ts` — `createDynamicQuiz` (builds quiz + attempt, redirects), `completeQuizAttempt`
  - `db-health.ts` — DB health check
- **`app/lib/prisma.ts`** — Prisma client singleton. Always import `prisma` from here.
- **`app/lib/dashboard.ts`** — `getDashboardData(userId, page)`, `QUIZ_PAGE_SIZE`.
- **`app/lib/subject-colors.ts`** — `getSubjectColors(code)` maps IGCSE subject codes to color profiles.
- **`app/lib/format.ts`** — `formatRelativeTime(date)`, `formatDuration(seconds)`.
- **`app/auth.ts`** — Auth.js v5 config. Import `auth`, `signIn`, `signOut`, `handlers` from here. Includes `events.createUser` hook that backfills `user.name` from email prefix if blank.
- **`app/prisma/schema.prisma`** — Source of truth for the DB. Run `prisma migrate dev` after changes.
- **`app/components/ui/`** — shadcn/ui components.
- **`app/components/animate-ui/`** — Custom animated components (built on framer-motion, NOT the animate-ui npm package which has incompatible deps).
  - `toggle-group.tsx` — `<ToggleGroup>` with framer-motion `layoutId` sliding pill (indigo-600 active state). Used in quiz start form.
- **`app/components/animated-cards.tsx`** — Stagger animation wrapper for card grids.
- **`app/components/animated-counter.tsx`** — Animated number counter for stats.
- **`app/components/greeting-card.tsx`** — Client component; dashboard hero banner with floating framer-motion bubbles.
- **`app/components/hero-section.tsx`** — Landing page hero with fan-in/fan-out floating card stack.
- **`app/components/user-quiz-card.tsx`** — Quiz attempt card for the dashboard grid.
- **`app/components/subject-card.tsx`** — Subject tile for Browse Subjects section.
- **`app/types/next-auth.d.ts`** — Augments `Session` and `User` with `id: string` and `role: Role`.

### Client form extraction pattern
When a page's form needs client-side interactivity (e.g., animated selections), keep the page as a server component and extract the form into a `quiz-form.tsx` (or similar) `'use client'` sibling file. Pass DB data as props; import the server action directly — Next.js App Router supports importing server actions in client components.

### Design system conventions
- Page backgrounds: `bg-indigo-50`
- Accent / active state: `bg-indigo-600 text-white` — **do not change this when doing layout or icon work**
- Text hierarchy: `text-slate-900` headings, `text-slate-500` secondary, `text-slate-400` muted
- Card base: `bg-white rounded-xl border border-slate-200 shadow-sm`

## Auth

Magic-link only (no passwords). User enters email → Resend sends magic link → user clicks → database session created. Call `auth()` directly in server components to read the session.

## Database

Two groups of models in `prisma/schema.prisma`:
1. **Auth.js adapter models** (`User`, `Account`, `Session`, `VerificationToken`) — field names are required by `@auth/prisma-adapter`; do not rename.
2. **Domain models** (`Subject`, `Topic`, `Flashcard`, `Quiz`, `QuizFlashcard`, `QuizAttempt`, `QuizAttemptAnswer`, `AiReport`).

`QuizAttempt.aiAnalysis` and `AiReport` are schema stubs for future AI analysis features — not yet wired up.

## Flashcard Content

Past-paper flashcards live in `material/<subject-name>/flashcards.json` (gitignored). Each JSON file is generated by reading Cambridge QP + MS PDFs and running a cross-year frequency analysis. See `FLASHCARD-METHODOLOGY.md` for the full process and how to add a new subject.

Seed scripts live in `app/prisma/seed-<subject>.ts`. Run them from `app/`:

| Command | Purpose |
|---|---|
| `npx tsx prisma/seed-biology.ts` | Seed 145 Biology flashcards (from `material/biology/flashcards.json`) |
| `npx tsx prisma/seed-biology.ts --force` | Wipe and re-seed Biology flashcards |

Each `Flashcard` record stores `frequency` (how often the concept appeared in past papers) and a `FlashcardSource` join table with exact paper/year/session/question references.

## Key Next.js 16 differences

- `middleware.ts` is now `proxy.ts`
- `cookies()`, `headers()`, `params`, `searchParams` are **fully async** (sync access removed)
- Turbopack is the default bundler for `next dev` and `next build`
- Tailwind v4 — no `tailwind.config.ts`; all config via CSS
