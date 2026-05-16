# Quiz Attempt Review + Dashboard Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full per-question review page for completed quiz attempts, make "Your Quizzes" cards clickable to that page, and paginate the section to 12 per page.

**Architecture:** A new server-component review page at `/dashboard/quiz/[attemptId]/review` fetches the attempt's `QuizFlashcard` rows (ordered by `order`) joined to `QuizAttemptAnswer` via a Map, rendering each question with the user's correct/incorrect result and the correct answer. Pagination is URL-based (`?page=N`) so the dashboard page remains a server component — `getDashboardData` gains a `page` arg and returns a `totalQuizzes` count.

**Tech Stack:** Next.js 16 App Router (server components), Prisma 6 / MySQL, Tailwind CSS v4, `@/components/html-content` for HTML rendering, `@/lib/format` for duration formatting.

---

## File Map

| Action | Path |
|--------|------|
| **Modify** | `app/lib/dashboard.ts` — add `page` param, `QUIZ_PAGE_SIZE`, `totalQuizzes` count |
| **Modify** | `app/app/dashboard/page.tsx` — accept `searchParams`, paginate grid, clickable cards |
| **Create** | `app/app/dashboard/quiz/[attemptId]/review/page.tsx` — review server component |
| **Modify** | `app/app/dashboard/quiz/[attemptId]/page.tsx` — redirect completed → review |
| **Modify** | `app/components/quiz-session.tsx` — add "View full review →" button on score screen |

---

### Task 1: Add pagination support to `getDashboardData`

**Files:**
- Modify: `app/lib/dashboard.ts`

- [ ] **Step 1: Replace the file with the paginated version**

```ts
// app/lib/dashboard.ts
import { prisma } from "@/lib/prisma"

export const QUIZ_PAGE_SIZE = 12

export async function getDashboardData(userId: string, page = 1) {
  const skip = (page - 1) * QUIZ_PAGE_SIZE

  const [userQuizzes, totalQuizzes, recentAttempts, subjects, stats] =
    await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        skip,
        take: QUIZ_PAGE_SIZE,
        include: {
          quiz: {
            select: {
              title: true,
              subject: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.quizAttempt.count({
        where: { userId, completedAt: { not: null } },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          quiz: {
            select: {
              title: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
      prisma.subject.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { quizzes: true, flashcards: true } },
        },
      }),
      prisma.quizAttempt.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: { score: true },
      }),
    ])

  return { userQuizzes, totalQuizzes, recentAttempts, subjects, stats }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `app/`:
```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```
Expected: no type errors (the `UserQuiz` and `Attempt` types derive from the return type, so they update automatically).

- [ ] **Step 3: Commit**

```bash
git add app/lib/dashboard.ts
git commit -m "feat: add pagination support to getDashboardData (PAGE_SIZE=12)"
```

---

### Task 2: Update dashboard page — pagination UI + clickable quiz cards

**Files:**
- Modify: `app/app/dashboard/page.tsx`

The current file renders `DashboardPage` without `searchParams`. We need to:
1. Accept `searchParams: Promise<{ page?: string }>`
2. Pass `page` to `getDashboardData`
3. Make `UserQuizCard` link to the review page
4. Add prev/next pagination controls below the "Your Quizzes" grid

- [ ] **Step 1: Update `DashboardPage` signature and data fetch**

Replace the existing `DashboardPage` function signature and first few lines:

```tsx
// Replace:
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { userQuizzes, recentAttempts, subjects, stats } =
    await getDashboardData(session.user.id)

// With:
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
```

Also add `QUIZ_PAGE_SIZE` to the import from `@/lib/dashboard`:
```tsx
import { getDashboardData, QUIZ_PAGE_SIZE } from "@/lib/dashboard"
```

- [ ] **Step 2: Add `totalPages` variable after the destructure**

Immediately after the `getDashboardData` call, add:
```tsx
  const totalPages = Math.max(1, Math.ceil(totalQuizzes / QUIZ_PAGE_SIZE))
```

- [ ] **Step 3: Replace the "Your Quizzes" section with pagination support**

Find this block (around line 86):
```tsx
        {/* Your Quizzes — takes 2/3 width on large screens */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Your Quizzes" />
            <Link
              href="/dashboard/quiz/start"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              + New quiz
            </Link>
          </div>
          {userQuizzes.length === 0 ? (
            <EmptyState message="No quizzes yet — hit 'Start Quiz' to begin!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userQuizzes.map((attempt) => (
                <UserQuizCard key={attempt.id} attempt={attempt} />
              ))}
            </div>
          )}
        </section>
```

Replace with:
```tsx
        {/* Your Quizzes — takes 2/3 width on large screens */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Your Quizzes" />
            <Link
              href="/dashboard/quiz/start"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              + New quiz
            </Link>
          </div>
          {userQuizzes.length === 0 && page === 1 ? (
            <EmptyState message="No quizzes yet — hit 'Start Quiz' to begin!" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userQuizzes.map((attempt) => (
                  <UserQuizCard key={attempt.id} attempt={attempt} />
                ))}
              </div>
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
```

- [ ] **Step 4: Update `UserQuizCard` to be clickable + show review link**

Replace the entire `UserQuizCard` function:
```tsx
function UserQuizCard({ attempt }: { attempt: UserQuiz }) {
  const color = scoreColor(attempt.score)
  const date = attempt.completedAt
    ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : ""

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:border-slate-300 transition-colors">
      <Link href={`/dashboard/quiz/${attempt.id}/review`} className="block">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {attempt.quiz.subject.name}
        </p>
        <p className="font-semibold text-slate-900 mt-0.5 line-clamp-1 text-sm">
          {attempt.quiz.title}
        </p>
        <p className={`text-2xl font-black mt-2 ${color}`}>{attempt.score}%</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {attempt.correctAnswers}/{attempt.totalQuestions} correct &middot;{" "}
          {formatDuration(attempt.durationSeconds)} &middot; {date}
        </p>
      </Link>
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/dashboard/quiz/start?subjectId=${attempt.quiz.subject.id}`}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "flex-1")}
        >
          Retake
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build to verify no type errors**

```bash
npm run build 2>&1 | grep -E "error|Error|✓|Route"
```
Expected: clean build listing all routes.

- [ ] **Step 6: Commit**

```bash
git add app/app/dashboard/page.tsx
git commit -m "feat: paginate Your Quizzes (12/page) and link cards to review"
```

---

### Task 3: Create the attempt review page

**Files:**
- Create: `app/app/dashboard/quiz/[attemptId]/review/page.tsx`

This server component fetches the attempt (guard: must belong to current user AND be completed), merges quiz flashcard order with per-answer results, and renders a full per-question breakdown.

- [ ] **Step 1: Create the file**

```tsx
// app/app/dashboard/quiz/[attemptId]/review/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatDuration } from "@/lib/format"
import { HtmlContent } from "@/components/html-content"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Quiz Review — IGCSE FlashCards" }

const DIFF_STYLES = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
}

type Props = { params: Promise<{ attemptId: string }> }

export default async function ReviewPage({ params }: Props) {
  const [session, { attemptId }] = await Promise.all([auth(), params])
  if (!session?.user?.id) redirect("/login")

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId, userId: session.user.id, completedAt: { not: null } },
    select: {
      id: true,
      score: true,
      correctAnswers: true,
      totalQuestions: true,
      durationSeconds: true,
      completedAt: true,
      quiz: {
        select: {
          title: true,
          subject: { select: { name: true } },
          quizFlashcards: {
            orderBy: { order: "asc" },
            select: {
              flashcard: {
                select: {
                  id: true,
                  question: true,
                  answer: true,
                  explanation: true,
                  imageUrl: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      },
      answers: {
        select: { flashcardId: true, isCorrect: true, timeSpentSeconds: true },
      },
    },
  })

  if (!attempt) redirect("/dashboard")

  // Merge answers into the ordered flashcard list
  const answerMap = new Map(attempt.answers.map((a) => [a.flashcardId, a]))
  const items = attempt.quiz.quizFlashcards.map((qf, i) => ({
    index: i + 1,
    flashcard: qf.flashcard,
    answer: answerMap.get(qf.flashcard.id) ?? null,
  }))

  const scoreColor =
    attempt.score >= 80
      ? "text-emerald-600"
      : attempt.score >= 60
        ? "text-blue-600"
        : attempt.score >= 40
          ? "text-amber-500"
          : "text-red-500"

  const date = attempt.completedAt
    ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
            {attempt.quiz.subject.name}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            {attempt.quiz.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{date}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-600 shrink-0 mt-1"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Score summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-8">
        <div className="text-center shrink-0">
          <p className={`text-5xl font-black ${scoreColor}`}>{attempt.score}%</p>
          <p className="text-xs text-slate-400 mt-1">Score</p>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {attempt.correctAnswers}
            </p>
            <p className="text-xs text-slate-400">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">
              {attempt.totalQuestions - attempt.correctAnswers}
            </p>
            <p className="text-xs text-slate-400">Missed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatDuration(attempt.durationSeconds)}
            </p>
            <p className="text-xs text-slate-400">Duration</p>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="flex flex-col gap-4">
        {items.map(({ index, flashcard, answer }) => (
          <div
            key={flashcard.id}
            className={`bg-white rounded-2xl border p-5 ${
              answer === null
                ? "border-slate-200"
                : answer.isCorrect
                  ? "border-emerald-200"
                  : "border-red-100"
            }`}
          >
            {/* Row: question number, difficulty, result, time */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  Q{index}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[flashcard.difficulty]}`}
                >
                  {flashcard.difficulty[0] + flashcard.difficulty.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {answer?.timeSpentSeconds != null && (
                  <span className="text-xs text-slate-400 tabular-nums">
                    {answer.timeSpentSeconds}s
                  </span>
                )}
                {answer !== null && (
                  <span
                    className={`text-sm font-bold ${
                      answer.isCorrect ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {answer.isCorrect ? "✓ Got it" : "✗ Missed"}
                  </span>
                )}
              </div>
            </div>

            {/* Question */}
            <HtmlContent
              html={flashcard.question}
              className="text-sm font-semibold text-slate-900 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-0.5 [&_li]:font-normal [&_li]:text-slate-700 [&_p]:mb-0"
            />

            {flashcard.imageUrl && (
              <div className="rounded-xl border border-slate-100 overflow-hidden mt-3">
                <img
                  src={`/flashcard-images/${flashcard.imageUrl}`}
                  alt="Exam diagram"
                  className="w-full"
                />
              </div>
            )}

            {/* Answer */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Answer
              </p>
              <HtmlContent
                html={flashcard.answer}
                className="text-sm text-slate-700 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-0.5 [&_p]:mb-0"
              />
              {flashcard.explanation && (
                <HtmlContent
                  html={flashcard.explanation}
                  className="mt-2 text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5 [&_p]:mb-0"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/quiz/start"
          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
        >
          New quiz
        </Link>
        <Link href="/dashboard" className={cn(buttonVariants(), "flex-1")}>
          Dashboard
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Build to verify no type errors**

```bash
npm run build 2>&1 | grep -E "error|Error|✓|Route"
```
Expected: `ƒ /dashboard/quiz/[attemptId]/review` appears in route list with no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/app/dashboard/quiz/[attemptId]/review/page.tsx"
git commit -m "feat: add quiz attempt review page with per-question breakdown"
```

---

### Task 4: Redirect completed attempts from in-progress page to review

**Files:**
- Modify: `app/app/dashboard/quiz/[attemptId]/page.tsx` (line 56)

Currently a completed attempt redirects to `/dashboard`. It should redirect to its own review page instead, so navigating to a completed quiz URL lands correctly.

- [ ] **Step 1: Change the completed-attempt redirect**

Find this line (line 56):
```tsx
  if (attempt.completedAt) redirect("/dashboard")
```

Replace with:
```tsx
  if (attempt.completedAt) redirect(`/dashboard/quiz/${attempt.id}/review`)
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add "app/app/dashboard/quiz/[attemptId]/page.tsx"
git commit -m "fix: redirect completed quiz attempt URLs to review page"
```

---

### Task 5: Add "View full review" button to quiz session score screen

**Files:**
- Modify: `app/components/quiz-session.tsx` (score screen section, around line 129)

The score screen already shows "Try again" and "Dashboard". Add a "View full review →" button below.

- [ ] **Step 1: Locate the button row in the score screen**

Find this block in `quiz-session.tsx` (inside the `if (complete)` branch):
```tsx
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/quiz/start")}
          >
            Try again
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
```

- [ ] **Step 2: Replace with the updated button group**

```tsx
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard/quiz/start")}
          >
            Try again
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => router.push(`/dashboard/quiz/${attemptId}/review`)}
        >
          View full review →
        </Button>
```

- [ ] **Step 3: Build and run tests**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
npm test
```
Expected: clean build, 33 tests pass.

- [ ] **Step 4: Commit and push**

```bash
git add app/components/quiz-session.tsx
git commit -m "feat: add View full review button to quiz score screen"
git push
```

---

## Self-Review

**Spec coverage:**
- ✓ Store/display quiz snapshot (questions + answers + user result) → Review page fetches from existing `QuizAttemptAnswer` + `QuizFlashcard` — no new schema needed
- ✓ Score visible on review → score summary card with %, correct, missed, duration
- ✓ Per-question breakdown → items loop with ✓/✗, time, question HTML, answer HTML, explanation
- ✓ Click into quizzes from "Your Quizzes" → `UserQuizCard` wraps title/score in a `Link` to review
- ✓ Pagination for Your Quizzes → `skip`/`take` in `getDashboardData`, prev/next UI in `DashboardPage`
- ✓ 12 per page → `QUIZ_PAGE_SIZE = 12`
- ✓ After quiz completes → "View full review →" button + redirect from `/quiz/[id]` for completed attempts

**Placeholder scan:** No TBDs, all code blocks complete.

**Type consistency:**
- `UserQuiz` derives from `getDashboardData` return type — picks up `id` automatically (it's included via Prisma `include`)
- `Attempt` (recentAttempts) — unchanged shape, still works
- `ReviewPage` uses inline types from Prisma select — no shared types to drift
