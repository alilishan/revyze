# Quiz Timer — Design Spec
_Date: 2026-05-15_

## Overview

Show a live elapsed timer during a quiz and surface the recorded time on the results screen, per-card breakdown, and dashboard history. The database already stores `durationSeconds` (total), `startedAt`, `completedAt` on `QuizAttempt`, and `timeSpentSeconds` on `QuizAttemptAnswer`. This feature is entirely a display-layer change — no schema or server-action modifications required.

## Architecture

Four files change, one new file is added:

| File | Change |
|---|---|
| `app/hooks/use-timer.ts` | **New** — `useTimer` hook |
| `app/lib/format.ts` | **New** — `formatDuration` utility |
| `app/components/quiz-session.tsx` | Add timer display, update results screen |
| `app/app/dashboard/quiz/[attemptId]/page.tsx` | Pass `startedAt` prop |
| `app/app/dashboard/page.tsx` | Add `durationSeconds` to query, render it |

## `useTimer` hook — `app/hooks/use-timer.ts`

```ts
useTimer(startedAt: Date): { elapsed: number; formatted: string }
```

- `elapsed` — integer seconds since `startedAt`
- Initialises to `Math.round((Date.now() - startedAt.getTime()) / 1000)` so a page refresh resumes from the correct point
- Ticks every second via `setInterval`; clears on unmount
- `formatted` — `mm:ss` string (e.g. `"1:04"`, `"10:02"`)

## `formatDuration` utility — `app/lib/format.ts`

```ts
formatDuration(seconds: number): string
// 83 → "1m 23s"
// 60 → "1m 0s"
// 45 → "45s"
```

Used on the results screen and dashboard history cards (static rendering, no live ticking needed there).

## `QuizSession` changes — `components/quiz-session.tsx`

**New prop:** `startedAt: Date`

**During the quiz:**
- Replace ad-hoc `sessionStart = useRef(Date.now())` display logic with `useTimer(startedAt)`
- Keep the existing `sessionStart.current` ref for computing the final `durationSeconds` passed to `completeQuizAttempt` (no server-action change)
- Progress bar row becomes: `[ ████░░░░░░ ]  3/10   ⏱ 1:04`

**Results screen:**
- Below the score percentage, add: `{correct} of {total} correct · {formatDuration(totalDuration)}`
- Per-card breakdown list: add a `{timeSpentSeconds}s` suffix to each row

## Server page — `app/dashboard/quiz/[attemptId]/page.tsx`

Single change: pass `startedAt={attempt.startedAt}` to `<QuizSession>`.

## Dashboard history — `app/dashboard/page.tsx`

- Add `durationSeconds: true` to the `QuizAttempt` select
- Render `formatDuration(attempt.durationSeconds)` alongside the date on each history card

## Out of scope

- No countdown timer (time limits)
- No per-card timer shown _during_ the quiz (only on the results screen after)
- No schema changes
- No server action changes
