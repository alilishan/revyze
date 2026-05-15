# Quiz Timer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a live elapsed timer during a quiz and surface the recorded time on the results screen, per-card breakdown, and dashboard history.

**Architecture:** All timing data is already stored in the DB (`durationSeconds`, `startedAt`, `completedAt` on `QuizAttempt`; `timeSpentSeconds` on `QuizAttemptAnswer`). This is a pure display-layer change. A `useTimer` hook drives the live clock; a `formatDuration` utility formats stored seconds for static display.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest (node environment)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/lib/format.ts` | `formatDuration(s)` — formats stored seconds as "Xm Ys" |
| Create | `app/hooks/use-timer.ts` | `useTimer(startedAt)` — live elapsed tick; exports `formatTime` helper |
| Modify | `app/app/dashboard/quiz/[attemptId]/page.tsx` | Pass `startedAt` prop to `<QuizSession>` |
| Modify | `app/components/quiz-session.tsx` | Add timer display, per-card time on results screen |
| Modify | `app/app/dashboard/page.tsx` | Show `formatDuration` on history cards |
| Create | `app/__tests__/lib/format.test.ts` | Tests for `formatDuration` |
| Create | `app/__tests__/hooks/use-timer.test.ts` | Tests for `formatTime` helper |

> **Note:** `app/lib/dashboard.ts` needs no changes. Its queries use `include` (not `select`) on `QuizAttempt`, so `durationSeconds` is already returned by Prisma.

---

### Task 1: `formatDuration` utility

**Files:**
- Create: `app/lib/format.ts`
- Create: `app/__tests__/lib/format.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/__tests__/lib/format.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { formatDuration } from "@/lib/format"

describe("formatDuration", () => {
  it("returns seconds-only for values under 60", () => {
    expect(formatDuration(45)).toBe("45s")
    expect(formatDuration(0)).toBe("0s")
    expect(formatDuration(59)).toBe("59s")
  })

  it("returns minutes and seconds for values 60 and above", () => {
    expect(formatDuration(60)).toBe("1m 0s")
    expect(formatDuration(83)).toBe("1m 23s")
    expect(formatDuration(3661)).toBe("61m 1s")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd app && npm test -- __tests__/lib/format.test.ts
```

Expected: FAIL with "Cannot find module '@/lib/format'"

- [ ] **Step 3: Create `app/lib/format.ts`**

```ts
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd app && npm test -- __tests__/lib/format.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/lib/format.ts app/__tests__/lib/format.test.ts
git commit -m "feat: add formatDuration utility"
```

---

### Task 2: `useTimer` hook

**Files:**
- Create: `app/hooks/use-timer.ts`
- Create: `app/__tests__/hooks/use-timer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/__tests__/hooks/use-timer.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { formatTime } from "@/hooks/use-timer"

describe("formatTime", () => {
  it("formats seconds under 60 as 0:ss", () => {
    expect(formatTime(0)).toBe("0:00")
    expect(formatTime(9)).toBe("0:09")
    expect(formatTime(59)).toBe("0:59")
  })

  it("formats seconds >= 60 as m:ss", () => {
    expect(formatTime(60)).toBe("1:00")
    expect(formatTime(64)).toBe("1:04")
    expect(formatTime(602)).toBe("10:02")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd app && npm test -- __tests__/hooks/use-timer.test.ts
```

Expected: FAIL with "Cannot find module '@/hooks/use-timer'"

- [ ] **Step 3: Create `app/hooks/use-timer.ts`**

```ts
"use client"

import { useState, useEffect } from "react"

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function useTimer(startedAt: Date): { elapsed: number; formatted: string } {
  const [elapsed, setElapsed] = useState(() =>
    Math.round((Date.now() - startedAt.getTime()) / 1000)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return { elapsed, formatted: formatTime(elapsed) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd app && npm test -- __tests__/hooks/use-timer.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add app/hooks/use-timer.ts app/__tests__/hooks/use-timer.test.ts
git commit -m "feat: add useTimer hook"
```

---

### Task 3: Pass `startedAt` to `QuizSession`

**Files:**
- Modify: `app/app/dashboard/quiz/[attemptId]/page.tsx`

- [ ] **Step 1: Update the `<QuizSession>` call**

In `app/app/dashboard/quiz/[attemptId]/page.tsx`, find line 82:
```tsx
<QuizSession attemptId={attempt.id} flashcards={flashcards} />
```
Replace with:
```tsx
<QuizSession attemptId={attempt.id} flashcards={flashcards} startedAt={attempt.startedAt} />
```

- [ ] **Step 2: Verify the build is clean**

```bash
cd app && npm run build 2>&1 | tail -20
```

Expected: Build error — `startedAt` prop not accepted by `QuizSession` yet. This is expected; Task 4 adds it.

- [ ] **Step 3: Commit (after Task 4 passes the build)**

Wait until Task 4 is complete, then commit both together:

```bash
git add app/app/dashboard/quiz/[attemptId]/page.tsx app/components/quiz-session.tsx
git commit -m "feat: add live timer to quiz session"
```

---

### Task 4: Add timer display to `QuizSession`

**Files:**
- Modify: `app/components/quiz-session.tsx`

- [ ] **Step 1: Add imports at the top of `quiz-session.tsx`**

After the existing imports, add:
```tsx
import { useTimer } from "@/hooks/use-timer"
import { formatDuration } from "@/lib/format"
```

- [ ] **Step 2: Add `startedAt` prop and hook setup**

Find the component signature (line 44–50):
```tsx
export function QuizSession({
  attemptId,
  flashcards,
}: {
  attemptId: string
  flashcards: Flashcard[]
}) {
```
Replace with:
```tsx
export function QuizSession({
  attemptId,
  flashcards,
  startedAt,
}: {
  attemptId: string
  flashcards: Flashcard[]
  startedAt: Date
}) {
```

- [ ] **Step 3: Add `useTimer` call and `totalDuration` state**

Find these lines inside the component body (around line 52–56):
```tsx
  const sessionStart = useRef(Date.now())
  const cardStart = useRef(Date.now())
```
Replace with:
```tsx
  const sessionStart = useRef(Date.now())
  const cardStart = useRef(Date.now())
  const { formatted } = useTimer(startedAt)
  const [totalDuration, setTotalDuration] = useState(0)
```

- [ ] **Step 4: Capture `totalDuration` when quiz completes**

Find this block inside `handleAnswer` (around line 73–77):
```tsx
    if (index === total - 1) {
      setSaving(true)
      const duration = Math.round((Date.now() - sessionStart.current) / 1000)
      await completeQuizAttempt(attemptId, updated, duration)
      setComplete(true)
      setSaving(false)
```
Replace with:
```tsx
    if (index === total - 1) {
      setSaving(true)
      const duration = Math.round((Date.now() - sessionStart.current) / 1000)
      await completeQuizAttempt(attemptId, updated, duration)
      setTotalDuration(duration)
      setComplete(true)
      setSaving(false)
```

- [ ] **Step 5: Add timer to the progress bar row**

Find the progress bar section (around line 142–152):
```tsx
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          {index + 1} / {total}
        </span>
      </div>
```
Replace with:
```tsx
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          {index + 1} / {total}
        </span>
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          ⏱ {formatted}
        </span>
      </div>
```

- [ ] **Step 6: Update the results screen — score line and per-card breakdown**

Find the results screen score section (around line 95–98):
```tsx
          <p className="text-6xl font-black text-slate-900">{score}%</p>
          <p className="text-slate-500 mt-2 text-sm">
            {correct} out of {total} correct
          </p>
```
Replace with:
```tsx
          <p className="text-6xl font-black text-slate-900">{score}%</p>
          <p className="text-slate-500 mt-2 text-sm">
            {correct} out of {total} correct &middot; {formatDuration(totalDuration)}
          </p>
```

Find the per-card breakdown (around line 104–115):
```tsx
          {/* Per-card breakdown */}
          <div className="mt-6 space-y-1 text-left max-h-48 overflow-y-auto">
            {answers.map((a, i) => (
              <div
                key={a.flashcardId}
                className="flex items-center gap-2 text-xs text-slate-500 py-0.5"
              >
                <span>{a.isCorrect ? "✓" : "✗"}</span>
                <span className="line-clamp-1 flex-1">
                  {flashcards[i].question}
                </span>
              </div>
            ))}
          </div>
```
Replace with:
```tsx
          {/* Per-card breakdown */}
          <div className="mt-6 space-y-1 text-left max-h-48 overflow-y-auto">
            {answers.map((a, i) => (
              <div
                key={a.flashcardId}
                className="flex items-center gap-2 text-xs text-slate-500 py-0.5"
              >
                <span>{a.isCorrect ? "✓" : "✗"}</span>
                <span className="line-clamp-1 flex-1">
                  {flashcards[i].question}
                </span>
                <span className="tabular-nums shrink-0">{a.timeSpentSeconds}s</span>
              </div>
            ))}
          </div>
```

- [ ] **Step 7: Build to confirm no TypeScript errors**

```bash
cd app && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no type errors.

- [ ] **Step 8: Commit (together with Task 3's page change)**

```bash
git add app/app/dashboard/quiz/[attemptId]/page.tsx app/components/quiz-session.tsx
git commit -m "feat: add live timer to quiz session"
```

---

### Task 5: Show duration in dashboard history cards

**Files:**
- Modify: `app/app/dashboard/page.tsx`

> **Note:** No changes needed to `app/lib/dashboard.ts`. The Prisma queries use `include` on the relation (not `select` on the top-level model), so `durationSeconds` is already present in both `userQuizzes` and `recentAttempts` query results.

- [ ] **Step 1: Import `formatDuration` in the dashboard page**

At the top of `app/app/dashboard/page.tsx`, after the existing imports, add:
```tsx
import { formatDuration } from "@/lib/format"
```

- [ ] **Step 2: Add duration to `UserQuizCard`**

Find the metadata line in `UserQuizCard` (around line 171–173):
```tsx
          <p className="text-xs text-slate-400 mt-0.5">
            {attempt.correctAnswers}/{attempt.totalQuestions} correct &middot; {date}
          </p>
```
Replace with:
```tsx
          <p className="text-xs text-slate-400 mt-0.5">
            {attempt.correctAnswers}/{attempt.totalQuestions} correct &middot; {formatDuration(attempt.durationSeconds)} &middot; {date}
          </p>
```

- [ ] **Step 3: Add duration to `AttemptCard`**

Find the date/status span in `AttemptCard` (around line 197–203):
```tsx
        <span className="text-xs text-slate-400">
          {attempt.completedAt
            ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : "In progress"}
        </span>
```
Replace with:
```tsx
        <div className="text-right">
          <p className="text-xs text-slate-400">
            {attempt.completedAt
              ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })
              : "In progress"}
          </p>
          {attempt.completedAt && (
            <p className="text-xs text-slate-400">{formatDuration(attempt.durationSeconds)}</p>
          )}
        </div>
```

- [ ] **Step 4: Build to confirm no TypeScript errors**

```bash
cd app && npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 5: Run the full test suite**

```bash
cd app && npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/app/dashboard/page.tsx
git commit -m "feat: show quiz duration in dashboard history"
```
