# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IGCSE FlashCards — a multi-user flashcard and quiz platform for Cambridge IGCSE students.
The Next.js 16 app lives inside `app/`. Run all dev commands from there (`cd app`).

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

## Architecture

- **`app/app/`** — App Router. All pages are server components by default; add `'use client'` only where interactivity is needed.
- **`app/actions/`** — Server actions. `db-health.ts` (DB health check), `auth.ts` (sign-in/sign-out).
- **`app/lib/prisma.ts`** — Prisma client singleton. Always import `prisma` from here.
- **`app/auth.ts`** — Auth.js v5 config. Import `auth`, `signIn`, `signOut`, `handlers` from here.
- **`app/prisma/schema.prisma`** — Source of truth for the DB. Run `prisma migrate dev` after changes.
- **`app/components/ui/`** — shadcn/ui components.
- **`app/types/next-auth.d.ts`** — Augments `Session` and `User` with `id: string` and `role: Role`.

## Auth

Magic-link only (no passwords). User enters email → Resend sends magic link → user clicks → database session created. Call `auth()` directly in server components to read the session.

## Database

Two groups of models in `prisma/schema.prisma`:
1. **Auth.js adapter models** (`User`, `Account`, `Session`, `VerificationToken`) — field names are required by `@auth/prisma-adapter`; do not rename.
2. **Domain models** (`Subject`, `Topic`, `Flashcard`, `Quiz`, `QuizFlashcard`, `QuizAttempt`, `QuizAttemptAnswer`, `AiReport`).

`QuizAttempt.aiAnalysis` and `AiReport` are schema stubs for future AI analysis features — not yet wired up.

## Key Next.js 16 differences

- `middleware.ts` is now `proxy.ts`
- `cookies()`, `headers()`, `params`, `searchParams` are **fully async** (sync access removed)
- Turbopack is the default bundler for `next dev` and `next build`
- Tailwind v4 — no `tailwind.config.ts`; all config via CSS
