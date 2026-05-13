# IGCSE FlashCards — Bootstrap Design Spec

**Date:** 2026-05-13
**Status:** Approved
**Scope:** Foundation bootstrap only — auth, schema, home page. No quiz flow yet.

---

## 1. Goal

Build the foundation of a multi-user IGCSE flashcard and quiz platform. Students can study flashcards by subject, take quizzes, and have their score and quiz duration tracked per attempt. This spec covers the initial bootstrap: project scaffolding, database schema, magic-link authentication, and a starter home page.

---

## 2. Repository Structure

```
gcseFlashcards/
  app/                          ← Next.js project root (all dev commands run from here)
    app/                        ← Next.js App Router
      (auth)/
        login/
          page.tsx              ← magic link sign-in page
      api/
        auth/[...nextauth]/
          route.ts              ← Auth.js v5 handler
      page.tsx                  ← home page (server component)
      layout.tsx                ← root layout
    components/
      ui/                       ← shadcn/ui components
    lib/
      prisma.ts                 ← singleton Prisma client
    actions/
      db-health.ts              ← checkDbConnection server action
    auth.ts                     ← Auth.js config
    prisma/
      schema.prisma
      seed.ts                   ← optional seed data
    types/
      next-auth.d.ts            ← session type augmentation
    .env.example
    .env.local                  ← gitignored
  plans/                        ← design docs and implementation plans
  CLAUDE.md
```

---

## 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Auth.js v5 (NextAuth), magic link via Resend |
| ORM | Prisma |
| Database | MySQL |
| Email | Resend |

---

## 4. Database Schema

### Conventions
- Model names: PascalCase (e.g. `QuizAttempt`) — used directly as table names
- Field names: camelCase (e.g. `startedAt`, `totalQuestions`)

### Auth.js Adapter Models
Standard models required by `@auth/prisma-adapter` — shape must not be altered.
- `User` — extended with `role` (enum), `createdAt`, `updatedAt`
- `Account`
- `Session`
- `VerificationToken`

### Enums

```
enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

### Domain Models

**Subject**
- `id` String cuid
- `name` String
- `code` String (e.g. `0580` for IGCSE Maths)
- `description` String?
- `createdAt` DateTime
- `updatedAt` DateTime
- Relations: → many `Topic`, → many `Flashcard`, → many `Quiz`

**Topic**
- `id` String cuid
- `name` String
- `subjectId` String FK → Subject
- `createdAt` DateTime
- `updatedAt` DateTime
- Relations: → many `Flashcard`

**Flashcard**
- `id` String cuid
- `question` String @db.Text
- `answer` String @db.Text
- `explanation` String? @db.Text
- `difficulty` Difficulty default MEDIUM
- `subjectId` String FK → Subject
- `topicId` String? FK → Topic (optional)
- `createdAt` DateTime
- `updatedAt` DateTime

**Quiz**
- `id` String cuid
- `title` String
- `description` String? @db.Text
- `subjectId` String FK → Subject
- `createdAt` DateTime
- `updatedAt` DateTime
- Relations: → many `Flashcard` via `QuizFlashcard`, → many `QuizAttempt`

**QuizFlashcard** (join table — orders flashcards within a quiz)
- `quizId` String FK → Quiz
- `flashcardId` String FK → Flashcard
- `order` Int
- `@@id([quizId, flashcardId])`

**QuizAttempt**
- `id` String cuid
- `userId` String FK → User
- `quizId` String FK → Quiz
- `score` Int (0–100)
- `totalQuestions` Int
- `correctAnswers` Int
- `durationSeconds` Int
- `startedAt` DateTime
- `completedAt` DateTime?
- `aiAnalysis` String? @db.Text (nullable — reserved for future AI feedback per attempt)
- Relations: → many `QuizAttemptAnswer`

**QuizAttemptAnswer**
- `id` String cuid
- `attemptId` String FK → QuizAttempt
- `flashcardId` String FK → Flashcard
- `selectedAnswer` String
- `isCorrect` Boolean
- `timeSpentSeconds` Int? (nullable)

**AiReport** (stub for future multi-quiz AI analysis)
- `id` String cuid
- `userId` String FK → User
- `summary` String @db.Text
- `attemptIds` String @db.Text (JSON array of QuizAttempt ids)
- `createdAt` DateTime

---

## 5. Authentication

- **Provider:** Auth.js v5 Email provider (magic link)
- **Email transport:** Resend (`RESEND_API_KEY` env var)
- **Session strategy:** `database` — sessions stored in MySQL via Prisma adapter
- **Role propagation:** `session` callback adds `user.role` and `user.id` to the session object
- **Type augmentation:** `types/next-auth.d.ts` extends `Session` and `User` interfaces with `role: Role` and `id: string`
- **Sign-in flow:** User submits email → Auth.js creates `VerificationToken` → Resend sends magic link → user clicks → token verified → database session created → redirect to `/`
- **No passwords** — no password fields in schema

### Required env vars
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

---

## 6. Home Page (`app/app/page.tsx`)

Server component — reads session via `auth()` directly, no client-side fetch.

**Sections:**
1. **Header** — "IGCSE FlashCards" product name + tagline ("Revise smarter for Cambridge IGCSE")
2. **Feature cards** — three cards:
   - Multiple Subjects — covers the full IGCSE curriculum
   - Progress Tracking — multi-user, per-student history
   - Timed Quizzes — score and duration tracked every attempt
3. **DB status panel** — calls `checkDbConnection` server action; shows Connected/Not Connected badge, message string, and check timestamp
4. **CTA buttons** (shadcn):
   - `<Button>Start Revising</Button>`
   - `<Button variant="outline">Browse Subjects</Button>`
5. **Auth state strip** — if signed in: shows user email + Sign Out button; if not: shows Sign In prompt linking to `/login`

### `checkDbConnection` server action (`actions/db-health.ts`)
```ts
// Return type
{
  connected: boolean
  message: string
  checkedAt: string   // ISO timestamp
}
```
Runs `prisma.$queryRaw\`SELECT 1\`` in a try/catch. Returns success or the error message string. Never throws — always returns a typed result.

---

## 7. Out of Scope (This Sprint)

- Quiz taking flow
- Flashcard CRUD UI
- Subject/topic management
- AI analysis implementation (`aiAnalysis` field and `AiReport` model are schema stubs only)
- Role-based access control enforcement (role is stored, not yet checked)
- Teacher/admin dashboards

---

## 8. Assumptions

- MySQL instance is already provisioned; developer provides `DATABASE_URL` in `.env.local`
- Resend account exists and `RESEND_API_KEY` is available
- `RESEND_FROM_EMAIL` is a verified sender address in Resend
- No deployment target decided yet — app is local-first for now
