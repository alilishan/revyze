# Question Bank Page + HTML Rendering — Design Spec

**Date:** 2026-05-16
**Status:** Approved

---

## Overview

Two features, delivered together:

1. **Question Bank page** — `/dashboard/[subject]/questions` — a browsable, filterable, sortable list of all flashcards for a subject, with an answer drawer.
2. **HTML rendering** — questions and answers are stored as raw HTML and rendered safely via `isomorphic-dompurify` everywhere they appear (question bank and quiz session).

---

## Feature 1 — Question Bank Page

### Route

```
/dashboard/[subject]/questions
```

`[subject]` is the subject `code` field (e.g. `biology`). The server component looks up the subject by code and redirects to `/dashboard` if not found.

### Data Fetching

Server component fetches all flashcards for the subject in one query:

```ts
prisma.flashcard.findMany({
  where: { subject: { code: params.subject } },
  include: {
    topic: { select: { name: true } },
    sources: { select: { paper: true, year: true, session: true, questionNumber: true } },
  },
  orderBy: { frequency: 'desc' },
})
```

Also fetches the subject itself (`name`, `id`) to display in the page header.

### Client Component — `question-bank.tsx`

Receives the full flashcard list as props. Handles all filtering/sorting in memory (no round trips — 145–682 cards is trivially fast client-side).

**Filter state:**

| Field | Type | Default |
|---|---|---|
| `search` | `string` | `''` |
| `sort` | `'frequency' \| 'year'` | `'frequency'` |
| `topicId` | `string \| null` | `null` |
| `difficulty` | `'EASY' \| 'MEDIUM' \| 'HARD' \| null` | `null` |
| `year` | `string \| null` | `null` |
| `selectedId` | `string \| null` | `null` |

**Filter logic:**

- `search` — case-insensitive match against `stripHtml(question)` (so HTML tags don't pollute search)
- `topicId` — exact match on `flashcard.topicId`
- `difficulty` — exact match on `flashcard.difficulty`
- `year` — matches if any `source.year === year`
- `sort: 'frequency'` — descending by `frequency`, then by `id` for stability
- `sort: 'year'` — descending by the maximum year found in `sources`, then by `id`

**Available filter values** are derived from the full dataset (not filtered list), so options never disappear while filters are active.

### Filter Bar UI

Three rows inside a white rounded card:

1. **Search input** (full width) + **Filters button** (shows active filter count badge when > 0)
2. **Sort label** + **animate-ui ToggleGroup** (`⭐ Most Frequent` | `📅 Latest Year`) + result count
3. **Active filter pills** (one per active filter, each dismissable with ×) + "Clear all" link — row only renders when at least one filter is active

The Filters button opens a popover panel (anchored below the button) containing:
- Topic dropdown (select from all topics in the subject)
- Difficulty toggle group (All / Easy / Medium / Hard)
- Year dropdown (all unique years from sources, sorted descending)

### Question Card

Each card shows:
- Topic name (top-left) + frequency badge `⭐ N×` (top-right)
- Question rendered via `HtmlContent` (supports `<ul><li>` for MCQs)
- Footer row: difficulty badge + year chips (one per source year, deduplicated)
- Active card (open in drawer) gets a dark border

Clicking a card sets `selectedId` and opens the answer drawer.

### Answer Drawer — `answer-drawer.tsx`

**Responsive behaviour:**
- **Mobile (`< md`)** — fixed bottom sheet, slides up from the bottom. Backdrop overlay closes it.
- **Desktop (`≥ md`)** — right-side panel, sticky, 380px wide, sits alongside the card list within the content area. No overlay.

**Drawer content:**
- Topic + frequency badge
- Question (via `HtmlContent`)
- Divider
- Answer (via `HtmlContent`)
- Explanation (via `HtmlContent`, if present) — shown below answer with a left border accent
- Divider
- Past paper source chips (paper · session year Q number)
- Difficulty badge + "Appeared N times in past papers (YYYY–YYYY)" where the year range is min–max of all source years

Dismiss: × button, Escape key, clicking the backdrop (mobile only).

---

## Feature 2 — HTML Rendering

### Scope

All `question`, `answer`, and `explanation` fields may now contain HTML. The rendering change applies to:
- The new question bank page (all cards + drawer)
- The existing quiz session (`components/quiz-session.tsx`)

The quiz score screen shows question text in a `line-clamp-1` span — plain text only. `stripHtml()` is used there.

### `lib/html.ts`

```ts
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED: DOMPurify.Config = {
  ALLOWED_TAGS: ['p','ul','ol','li','strong','em','b','i','br','sub','sup','span','mark'],
  ALLOWED_ATTR: [],
}

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, ALLOWED)
}

export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
```

### `components/html-content.tsx`

```tsx
'use client'
import { sanitize } from '@/lib/html'

export function HtmlContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  )
}
```

### Changes to `quiz-session.tsx`

| Location | Before | After |
|---|---|---|
| Question text (line ~178) | `<p>{card.question}</p>` | `<HtmlContent html={card.question} />` |
| Answer text (line ~204) | `<p>{card.answer}</p>` | `<HtmlContent html={card.answer} />` |
| Explanation text (line ~206) | `<p>{card.explanation}</p>` | `<HtmlContent html={card.explanation} />` |
| Score screen question (line ~120) | `{flashcards[i].question}` | `{stripHtml(flashcards[i].question)}` |

---

## Dependencies

| Package | How added |
|---|---|
| `isomorphic-dompurify` | `npm install isomorphic-dompurify` (from `app/`) |
| `@types/dompurify` | `npm install -D @types/dompurify` |
| `@animate-ui/components-base-toggle-group` | `npx shadcn@latest add @animate-ui/components-base-toggle-group` (from `app/`) |

---

## Files — Full Change List

| File | Action |
|---|---|
| `app/app/dashboard/[subject]/questions/page.tsx` | **Create** — server component |
| `app/components/question-bank.tsx` | **Create** — client component (filter/sort/list) |
| `app/components/answer-drawer.tsx` | **Create** — responsive bottom/right sheet |
| `app/components/html-content.tsx` | **Create** — sanitized HTML renderer |
| `app/lib/html.ts` | **Create** — `sanitize()` + `stripHtml()` |
| `app/components/quiz-session.tsx` | **Edit** — 4 render sites updated |

---

## Out of Scope

- URL search param sync for filters (can be added later)
- Pagination (client-side filtering over ≤682 cards is fast enough)
- Editing flashcard HTML from the UI (content is authored in seed scripts / JSON files)
- Navigation link to the question bank from the dashboard (separate UX pass)
