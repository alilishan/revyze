# IGCSE FlashCards — Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full foundation of the IGCSE FlashCards platform — Next.js 15 project, MySQL schema via Prisma, Auth.js v5 magic-link auth with Resend, and a production-quality home page with a live database status panel.

**Architecture:** Next.js 15 App Router inside `app/` at the repo root; all pages are server components by default with `'use client'` added only where interactivity is required. Auth.js v5 uses the Prisma adapter with database sessions and a Resend email provider for magic-link sign-in. Server actions handle the database health check and auth flows.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Auth.js v5 (`next-auth@beta`), `@auth/prisma-adapter`, Prisma, MySQL (`mysql2`), Resend, Vitest.

---

## File Map

| File | Purpose |
|---|---|
| `app/prisma/schema.prisma` | Full database schema — Auth.js adapter models + domain models |
| `app/lib/prisma.ts` | Prisma client singleton (prevents hot-reload connection exhaustion) |
| `app/auth.ts` | Auth.js v5 config — Resend provider, Prisma adapter, session callback |
| `app/types/next-auth.d.ts` | Augments `Session` and `User` with `id` and `role` |
| `app/app/api/auth/[...nextauth]/route.ts` | Auth.js catch-all route handler |
| `app/actions/auth.ts` | `handleSignIn` and `handleSignOut` server actions |
| `app/actions/db-health.ts` | `checkDbConnection` server action |
| `app/app/(auth)/login/page.tsx` | Magic-link sign-in page |
| `app/app/page.tsx` | Home page — features, DB status, CTA |
| `app/app/layout.tsx` | Root layout with metadata |
| `app/.env.example` | Environment variable template |
| `app/prisma/seed.ts` | Seed IGCSE subjects for development |
| `app/__tests__/actions/db-health.test.ts` | Unit tests for `checkDbConnection` |
| `app/vitest.config.ts` | Vitest config with `@/*` alias resolution |

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `app/` (entire Next.js project via create-next-app)

- [ ] **Step 1: Run create-next-app from the repo root**

```bash
cd /path/to/gcseFlashcards
npx create-next-app@latest app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When prompted:
- Would you like to use Turbopack? → **No** (stable default for now)

- [ ] **Step 2: Verify the scaffold**

```bash
cd app
ls
```

Expected output includes: `app/  components/  lib/  public/  next.config.ts  package.json  tailwind.config.ts  tsconfig.json`

- [ ] **Step 3: Delete boilerplate page content**

Replace `app/app/page.tsx` with a minimal placeholder (will be replaced in Task 13):

```tsx
export default function HomePage() {
  return <main><p>IGCSE FlashCards — setting up…</p></main>
}
```

Replace `app/app/globals.css` — keep only the Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Verify the dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000` — should show "IGCSE FlashCards — setting up…". Stop the server (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 project with App Router"
```

---

## Task 2: Configure shadcn/ui

**Files:**
- Modify: `app/tailwind.config.ts`, `app/app/globals.css`
- Create: `app/components/ui/button.tsx`, `app/components/ui/input.tsx`, `app/lib/utils.ts`, `app/components.json`

- [ ] **Step 1: Run shadcn init (from inside `app/`)**

```bash
npx shadcn@latest init
```

When prompted:
- Which style? → **Default**
- Which base color? → **Slate**
- Use CSS variables? → **Yes**

- [ ] **Step 2: Add Button and Input components**

```bash
npx shadcn@latest add button input
```

Expected: `app/components/ui/button.tsx` and `app/components/ui/input.tsx` created.

- [ ] **Step 3: Verify imports resolve**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui with Button and Input components"
```

---

## Task 3: Install Prisma, Auth.js v5, and Resend dependencies

**Files:**
- Modify: `app/package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install next-auth@beta @auth/prisma-adapter @prisma/client mysql2 resend
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma vitest tsx
```

- [ ] **Step 3: Verify installed versions**

```bash
npm list next-auth @prisma/client prisma vitest
```

Expected: All packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add Prisma, Auth.js v5, Resend, and Vitest dependencies"
```

---

## Task 4: Initialize Prisma and write schema

**Files:**
- Create: `app/prisma/schema.prisma`
- Create: `app/.env` (from prisma init, do not commit — add to .gitignore)

- [ ] **Step 1: Initialize Prisma with MySQL**

```bash
npx prisma init --datasource-provider mysql
```

Expected: `prisma/schema.prisma` and `.env` created.

- [ ] **Step 2: Ensure `.env` is gitignored**

Check `app/.gitignore` contains `.env` and `.env.local`. If not, add them:

```
.env
.env.local
```

- [ ] **Step 3: Replace `prisma/schema.prisma` with the full schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

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

// ── Auth.js adapter models ────────────────────────────────────────────────────
// Do not rename fields — shape is required by @auth/prisma-adapter

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts     Account[]
  sessions     Session[]
  quizAttempts QuizAttempt[]
  aiReports    AiReport[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ── Domain models ─────────────────────────────────────────────────────────────

model Subject {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  description String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  topics     Topic[]
  flashcards Flashcard[]
  quizzes    Quiz[]
}

model Topic {
  id        String   @id @default(cuid())
  name      String
  subjectId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subject    Subject     @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  flashcards Flashcard[]
}

model Flashcard {
  id          String     @id @default(cuid())
  question    String     @db.Text
  answer      String     @db.Text
  explanation String?    @db.Text
  difficulty  Difficulty @default(MEDIUM)
  subjectId   String
  topicId     String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  subject        Subject             @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  topic          Topic?              @relation(fields: [topicId], references: [id], onDelete: SetNull)
  quizFlashcards QuizFlashcard[]
  attemptAnswers QuizAttemptAnswer[]
}

model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  subjectId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subject        Subject         @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  quizFlashcards QuizFlashcard[]
  attempts       QuizAttempt[]
}

model QuizFlashcard {
  quizId      String
  flashcardId String
  order       Int

  quiz      Quiz      @relation(fields: [quizId], references: [id], onDelete: Cascade)
  flashcard Flashcard @relation(fields: [flashcardId], references: [id], onDelete: Cascade)

  @@id([quizId, flashcardId])
}

model QuizAttempt {
  id              String    @id @default(cuid())
  userId          String
  quizId          String
  score           Int
  totalQuestions  Int
  correctAnswers  Int
  durationSeconds Int
  startedAt       DateTime
  completedAt     DateTime?
  aiAnalysis      String?   @db.Text

  user    User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz    Quiz                @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers QuizAttemptAnswer[]
}

model QuizAttemptAnswer {
  id               String  @id @default(cuid())
  attemptId        String
  flashcardId      String
  selectedAnswer   String
  isCorrect        Boolean
  timeSpentSeconds Int?

  attempt   QuizAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  flashcard Flashcard   @relation(fields: [flashcardId], references: [id], onDelete: Cascade)
}

model AiReport {
  id         String   @id @default(cuid())
  userId     String
  summary    String   @db.Text
  attemptIds String   @db.Text
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 4: Validate the schema**

```bash
npx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma .gitignore
git commit -m "feat: add complete Prisma schema with Auth.js adapter and domain models"
```

---

## Task 5: Run Prisma migration and generate client

**Files:**
- Create: `app/prisma/migrations/` (auto-generated)

- [ ] **Step 1: Set DATABASE_URL in `.env`**

Edit `app/.env`:

```
DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/igcse_flashcards"
```

Replace `YOUR_USER` and `YOUR_PASSWORD` with your MySQL credentials. Create the `igcse_flashcards` database first if it doesn't exist:

```sql
CREATE DATABASE igcse_flashcards CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- [ ] **Step 2: Run the initial migration**

```bash
npx prisma migrate dev --name init
```

Expected output ends with: `Your database is now in sync with your schema.`

- [ ] **Step 3: Verify tables exist**

```bash
npx prisma studio
```

Open `http://localhost:5555` — should list all models. Close with `Ctrl+C`.

- [ ] **Step 4: Commit migration files**

```bash
git add prisma/migrations/
git commit -m "feat: add initial database migration"
```

---

## Task 6: Create Prisma client singleton

**Files:**
- Create: `app/lib/prisma.ts`

- [ ] **Step 1: Create `lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat: add Prisma client singleton"
```

---

## Task 7: Set up Vitest and write checkDbConnection tests (TDD — failing)

**Files:**
- Create: `app/vitest.config.ts`
- Create: `app/__tests__/actions/db-health.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

- [ ] **Step 2: Add test script to `package.json`**

In `app/package.json`, add to the `"scripts"` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create test file for `checkDbConnection`**

```ts
// app/__tests__/actions/db-health.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe("checkDbConnection", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("returns connected: true and a success message when the query succeeds", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValue([{ 1: 1 }])

    const { checkDbConnection } = await import("@/actions/db-health")
    const result = await checkDbConnection()

    expect(result.connected).toBe(true)
    expect(result.message).toBe("Database connection successful")
    expect(typeof result.checkedAt).toBe("string")
    expect(() => new Date(result.checkedAt)).not.toThrow()
  })

  it("returns connected: false with the error message when the query throws", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("ECONNREFUSED 127.0.0.1:3306")
    )

    const { checkDbConnection } = await import("@/actions/db-health")
    const result = await checkDbConnection()

    expect(result.connected).toBe(false)
    expect(result.message).toBe("ECONNREFUSED 127.0.0.1:3306")
    expect(typeof result.checkedAt).toBe("string")
  })

  it("returns connected: false with a fallback message when a non-Error is thrown", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValue("string error")

    const { checkDbConnection } = await import("@/actions/db-health")
    const result = await checkDbConnection()

    expect(result.connected).toBe(false)
    expect(result.message).toBe("Unknown database error")
  })
})
```

- [ ] **Step 4: Run the tests — confirm they fail**

```bash
npm test
```

Expected: 3 tests **FAIL** with `Cannot find module '@/actions/db-health'`

- [ ] **Step 5: Commit the failing tests**

```bash
git add vitest.config.ts __tests__/ package.json
git commit -m "test: add failing tests for checkDbConnection (TDD)"
```

---

## Task 8: Implement checkDbConnection server action

**Files:**
- Create: `app/actions/db-health.ts`

- [ ] **Step 1: Create `actions/db-health.ts`**

```ts
"use server"

import { prisma } from "@/lib/prisma"

export type DbHealthResult = {
  connected: boolean
  message: string
  checkedAt: string
}

export async function checkDbConnection(): Promise<DbHealthResult> {
  const checkedAt = new Date().toISOString()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, message: "Database connection successful", checkedAt }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error"
    return { connected: false, message, checkedAt }
  }
}
```

- [ ] **Step 2: Run tests — confirm they pass**

```bash
npm test
```

Expected: 3 tests **PASS**

- [ ] **Step 3: Commit**

```bash
git add actions/db-health.ts
git commit -m "feat: implement checkDbConnection server action (TDD green)"
```

---

## Task 9: Configure Auth.js v5

**Files:**
- Create: `app/auth.ts`
- Create: `app/types/next-auth.d.ts`

- [ ] **Step 1: Create `auth.ts`**

```ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as { role: Role }).role
      return session
    },
  },
})
```

- [ ] **Step 2: Create `types/next-auth.d.ts`**

```ts
import type { DefaultSession } from "next-auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add auth.ts types/next-auth.d.ts
git commit -m "feat: configure Auth.js v5 with Resend magic-link and Prisma adapter"
```

---

## Task 10: Add Auth.js API route and auth server actions

**Files:**
- Create: `app/app/api/auth/[...nextauth]/route.ts`
- Create: `app/actions/auth.ts`

- [ ] **Step 1: Create `app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 2: Create `actions/auth.ts`**

```ts
"use server"

import { signIn, signOut } from "@/auth"

export async function handleSignIn(formData: FormData) {
  await signIn("resend", {
    email: formData.get("email") as string,
    redirectTo: "/",
  })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/ actions/auth.ts
git commit -m "feat: add Auth.js catch-all route and auth server actions"
```

---

## Task 11: Build the login page

**Files:**
- Create: `app/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create `app/(auth)/login/page.tsx`**

```tsx
import { handleSignIn } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — IGCSE FlashCards",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
        <p className="text-slate-500 text-sm mb-6">
          Enter your email and we&apos;ll send you a magic link.
        </p>
        <form action={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full">
            Send magic link
          </Button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: add magic-link login page"
```

---

## Task 12: Update root layout

**Files:**
- Modify: `app/app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx` content**

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IGCSE FlashCards",
  description:
    "Revise smarter for Cambridge IGCSE with flashcards and timed quizzes.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update root layout with Inter font and metadata"
```

---

## Task 13: Build the home page

**Files:**
- Modify: `app/app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with the full home page**

```tsx
import { auth } from "@/auth"
import { checkDbConnection } from "@/actions/db-health"
import { handleSignOut } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const [session, dbStatus] = await Promise.all([
    auth(),
    checkDbConnection(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-slate-900 tracking-tight">
            IGCSE FlashCards
          </span>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm text-slate-500 hidden sm:block">
                  {session.user.email}
                </span>
                <form action={handleSignOut}>
                  <Button variant="outline" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          IGCSE FlashCards
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-xl mx-auto">
          Master every Cambridge IGCSE subject with targeted flashcards, timed
          quizzes, and detailed progress tracking.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg">Start revising</Button>
          <Button size="lg" variant="outline">
            Browse subjects
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureCard
          title="Multiple subjects"
          description="Covers the full Cambridge IGCSE curriculum — Maths, Sciences, Humanities, Languages and more."
        />
        <FeatureCard
          title="Progress tracking"
          description="Every student's history stored individually. See score trends and time-spent per quiz over time."
        />
        <FeatureCard
          title="Timed quizzes"
          description="Attempt quizzes under exam conditions. Score, duration, and every answer are recorded automatically."
        />
      </section>

      {/* DB status */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div
          className={`rounded-xl border px-5 py-4 ${
            dbStatus.connected
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                dbStatus.connected ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-semibold text-slate-800">
              {dbStatus.connected ? "Database connected" : "Database not connected"}
            </span>
          </div>
          <p className="text-sm text-slate-600">{dbStatus.message}</p>
          <p className="text-xs text-slate-400 mt-1">
            Checked {new Date(dbStatus.checkedAt).toLocaleTimeString()}
          </p>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Start dev server and manually verify the page**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Title "IGCSE FlashCards" visible
- Three feature cards visible
- DB status panel shows connected/not-connected with a message
- "Start revising" and "Browse subjects" buttons visible
- Nav shows "Sign in" (since no session)

Stop the server (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build home page with feature cards, DB status panel, and auth state"
```

---

## Task 14: Add `.env.example`

**Files:**
- Create: `app/.env.example`

- [ ] **Step 1: Create `.env.example`**

```bash
# Database (MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/igcse_flashcards"

# Auth.js v5
# Generate with: openssl rand -base64 32
AUTH_SECRET="replace-with-output-of-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Resend (https://resend.com)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

- [ ] **Step 2: Copy to `.env.local` and fill in real values**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials.

- [ ] **Step 3: Verify `.env.local` is gitignored**

```bash
git check-ignore -v .env.local
```

Expected: `.gitignore:.env.local`

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "feat: add .env.example with all required environment variables"
```

---

## Task 15: Add seed data

**Files:**
- Modify: `app/package.json`
- Create: `app/prisma/seed.ts`

- [ ] **Step 1: Add seed script to `package.json`**

Add under the top-level `"prisma"` key (create it if it doesn't exist):

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SUBJECTS = [
  { name: "Mathematics", code: "0580", description: "Cambridge IGCSE Mathematics" },
  { name: "Physics", code: "0625", description: "Cambridge IGCSE Physics" },
  { name: "Chemistry", code: "0620", description: "Cambridge IGCSE Chemistry" },
  { name: "Biology", code: "0610", description: "Cambridge IGCSE Biology" },
  { name: "English Language", code: "0500", description: "Cambridge IGCSE English as a First Language" },
  { name: "Computer Science", code: "0478", description: "Cambridge IGCSE Computer Science" },
  { name: "History", code: "0470", description: "Cambridge IGCSE History" },
  { name: "Geography", code: "0460", description: "Cambridge IGCSE Geography" },
]

async function main() {
  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    })
  }
  console.log(`Seeded ${SUBJECTS.length} IGCSE subjects.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected: `Seeded 8 IGCSE subjects.`

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed data for IGCSE subjects"
```

---

## Task 16: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (repo root)

- [ ] **Step 1: Replace `CLAUDE.md` content**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IGCSE FlashCards — a multi-user flashcard and quiz platform for Cambridge IGCSE students.
The Next.js 15 app lives inside `app/`. Run all dev commands from there.

## Commands

All commands run from `app/`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npx prisma migrate dev` | Apply schema changes to the local DB |
| `npx prisma db seed` | Seed IGCSE subjects |
| `npx prisma studio` | Open Prisma Studio on http://localhost:5555 |
| `npx prisma generate` | Regenerate Prisma client after schema changes |

## Environment variables

Copy `app/.env.example` to `app/.env.local` and fill in:
- `DATABASE_URL` — MySQL connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `AUTH_URL` — `http://localhost:3000` in dev
- `RESEND_API_KEY` — from https://resend.com
- `RESEND_FROM_EMAIL` — verified sender address in Resend

## Architecture

- **`app/app/`** — Next.js App Router. All pages are server components by default; `'use client'` added only where interactivity is required.
- **`app/actions/`** — Server actions. `db-health.ts` for DB health check; `auth.ts` for sign-in/sign-out.
- **`app/lib/prisma.ts`** — Prisma client singleton. Import `prisma` from here everywhere.
- **`app/auth.ts`** — Auth.js v5 config. Import `auth`, `signIn`, `signOut`, `handlers` from here.
- **`app/prisma/schema.prisma`** — Source of truth for the DB schema. Run `prisma migrate dev` after any changes.
- **`app/components/ui/`** — shadcn/ui components.

## Auth flow

Magic-link only (no passwords). User submits email → Resend sends a magic link → user clicks → database session created. `auth()` called directly in server components to read the session.

## Database

MySQL via Prisma. Schema has two groups:
1. **Auth.js adapter models** (`User`, `Account`, `Session`, `VerificationToken`) — do not rename fields.
2. **Domain models** (`Subject`, `Topic`, `Flashcard`, `Quiz`, `QuizFlashcard`, `QuizAttempt`, `QuizAttemptAnswer`, `AiReport`).

`AiReport.attemptIds` is a JSON text column — stub for future multi-quiz AI analysis.
`QuizAttempt.aiAnalysis` is a nullable text column — stub for per-attempt AI feedback.
```

- [ ] **Step 2: Commit**

```bash
# from repo root
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with full project setup and architecture"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Next.js App Router project | Task 1 |
| shadcn/ui + Button + Input | Task 2 |
| Prisma + MySQL | Tasks 3–5 |
| Prisma singleton | Task 6 |
| Auth.js v5 magic link via Resend | Tasks 9–10 |
| Credentials login replaced by magic link | Tasks 9–11 (no passwords) |
| `prisma/schema.prisma` — all models | Task 4 |
| `lib/prisma.ts` | Task 6 |
| `auth.ts` | Task 9 |
| `app/api/auth/[...nextauth]/route.ts` | Task 10 |
| `actions/db-health.ts` + `checkDbConnection` | Tasks 7–8 |
| `app/page.tsx` — home page with all sections | Task 13 |
| `types/next-auth.d.ts` | Task 9 |
| `.env.example` | Task 14 |
| `prisma/seed.ts` | Task 15 |
| PascalCase model names / camelCase fields | Task 4 |
| `aiAnalysis` stub on `QuizAttempt` | Task 4 |
| `AiReport` stub model | Task 4 |
| TDD for `checkDbConnection` | Tasks 7–8 |
| CLAUDE.md updated | Task 16 |

All spec requirements covered.
