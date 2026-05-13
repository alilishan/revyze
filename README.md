# Revyze

A flashcard and quiz platform for Cambridge IGCSE students. Practice by subject, choose your difficulty, and track your progress over time.

## Stack

- **Next.js 16** — App Router, React 19, TypeScript
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.ts`
- **shadcn/ui v4** — component library via `@base-ui/react`
- **Auth.js v5** — magic link authentication via Resend (no passwords)
- **Prisma 6** — ORM with MySQL
- **Vitest** — unit testing

## Project Structure

```
gcseFlashcards/
├── app/                  # Next.js application
│   ├── app/              # App Router pages
│   │   ├── (auth)/       # Login & register pages
│   │   └── dashboard/    # Student dashboard + quiz flow
│   ├── actions/          # Server actions (auth, quiz)
│   ├── components/       # Shared UI components
│   ├── lib/              # Prisma client, utilities
│   ├── prisma/           # Schema, migrations, seed scripts
│   └── types/            # TypeScript augmentations
├── material/             # Study resources (gitignored)
└── plans/                # Design specs
```

## Getting Started

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Set up environment variables

```bash
cp app/.env.example app/.env.local
```

Fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` in development |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |

### 3. Set up the database

```bash
cd app
npx prisma migrate dev    # apply schema
npx prisma db seed        # seed IGCSE subjects
npx tsx prisma/seed-biology.ts  # seed Biology flashcards
```

### 4. Start the dev server

```bash
cd app
npm run dev               # http://localhost:3000
```

## Commands

All commands run from the `app/` directory.

### Development

```bash
npm run dev               # start dev server (Turbopack)
npm run build             # production build
npm run start             # start production server
npm run lint              # run ESLint
```

### Testing

```bash
npm test                  # run Vitest once
npm run test:watch        # Vitest in watch mode
```

### Database

```bash
npx prisma migrate dev    # apply schema changes to local DB
npx prisma db seed        # seed IGCSE subjects (Math, Physics, Chemistry, etc.)
npx tsx prisma/seed-biology.ts  # seed 145 Biology flashcards from past papers (2015–2025)
npx tsx prisma/seed-biology.ts --force  # wipe and re-seed Biology flashcards
npx prisma studio         # open Prisma Studio at http://localhost:5555
npx prisma generate       # regenerate Prisma client after schema changes
```

## Features

- **Magic link auth** — sign in or register with just your email
- **Student dashboard** — stats, available quizzes, recent activity, subject browser
- **Configurable quizzes** — choose subject, difficulty (Easy / Medium / Hard / Mixed), and number of questions (5–20)
- **Flashcard session** — reveal answer, mark correct or incorrect, see score breakdown at the end
- **Progress tracking** — every attempt is recorded with score, duration, and per-card answers

## Auth Flow

Users register with name + email → magic link sent via Resend → click link → session created. No passwords stored.
