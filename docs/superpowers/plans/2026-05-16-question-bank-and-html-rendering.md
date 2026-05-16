# Question Bank + HTML Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/dashboard/[subject]/questions` page that lists all flashcards for a subject with search/filter/sort and a responsive answer drawer, and make question/answer HTML render correctly everywhere.

**Architecture:** Client-side filtering over the full flashcard list (fast enough at ≤682 cards), with filter logic extracted to a pure `lib/filter-questions.ts` for testability. HTML is sanitised via `isomorphic-dompurify` in `lib/html.ts` and rendered through a shared `HtmlContent` component used in both the new question bank and the existing quiz session.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, `isomorphic-dompurify`, animate-ui ToggleGroup (via shadcn CLI), Vitest, Prisma 6.

---

## Task 1: Install dependencies

**Files:**
- Modify: `app/package.json` (via npm)

- [ ] **Step 1: Install isomorphic-dompurify and its types**

Run from `app/`:
```bash
npm install isomorphic-dompurify
npm install -D @types/dompurify
```

Expected output: packages added, no peer dep errors.

- [ ] **Step 2: Install animate-ui ToggleGroup via shadcn CLI**

Run from `app/`:
```bash
npx shadcn@latest add "@animate-ui/components-base-toggle-group"
```

When prompted, accept defaults. This adds the component to `components/ui/toggle-group.tsx`.

- [ ] **Step 3: Verify the toggle-group file was created**

```bash
ls app/components/ui/toggle-group.tsx
```

Expected: file exists. If the path differs, note the actual path — you'll import from it in Task 6.

- [ ] **Step 4: Commit**

```bash
git add app/package.json app/package-lock.json app/components/ui/toggle-group.tsx
git commit -m "chore: add isomorphic-dompurify and animate-ui toggle-group"
```

---

## Task 2: Create `lib/html.ts` with TDD

**Files:**
- Create: `app/lib/html.ts`
- Create: `app/lib/html.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/lib/html.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { sanitize, stripHtml } from './html'

describe('sanitize', () => {
  it('keeps allowed block tags', () => {
    expect(sanitize('<p>Hello</p>')).toBe('<p>Hello</p>')
  })

  it('keeps list tags', () => {
    expect(sanitize('<ul><li>A</li><li>B</li></ul>')).toBe('<ul><li>A</li><li>B</li></ul>')
  })

  it('keeps inline formatting', () => {
    expect(sanitize('<strong>bold</strong>')).toBe('<strong>bold</strong>')
    expect(sanitize('<em>italic</em>')).toBe('<em>italic</em>')
  })

  it('strips script tags', () => {
    expect(sanitize('<script>alert(1)</script>Hello')).toBe('Hello')
  })

  it('strips event handler attributes', () => {
    expect(sanitize('<p onclick="alert(1)">text</p>')).toBe('<p>text</p>')
  })

  it('strips disallowed tags but keeps text', () => {
    expect(sanitize('<iframe src="x"></iframe>text')).toBe('text')
  })
})

describe('stripHtml', () => {
  it('removes all tags and returns plain text', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('flattens list items into plain text', () => {
    expect(stripHtml('<ul><li>A</li><li>B</li></ul>')).toBe('AB')
  })

  it('passes plain text through unchanged', () => {
    expect(stripHtml('plain text')).toBe('plain text')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run from `app/`:
```bash
npm test -- lib/html.test.ts
```

Expected: `FAIL` — `Cannot find module './html'`

- [ ] **Step 3: Implement `lib/html.ts`**

Create `app/lib/html.ts`:
```ts
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br', 'sub', 'sup', 'span', 'mark'],
  ALLOWED_ATTR: [],
}

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, ALLOWED_CONFIG)
}

export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- lib/html.test.ts
```

Expected: all 9 tests `PASS`.

- [ ] **Step 5: Commit**

```bash
git add app/lib/html.ts app/lib/html.test.ts
git commit -m "feat: add sanitize and stripHtml helpers"
```

---

## Task 3: Create `components/html-content.tsx`

**Files:**
- Create: `app/components/html-content.tsx`

No unit test needed — it's a one-liner wrapper; the sanitize logic is tested in Task 2.

- [ ] **Step 1: Create the component**

Create `app/components/html-content.tsx`:
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

- [ ] **Step 2: Commit**

```bash
git add app/components/html-content.tsx
git commit -m "feat: add HtmlContent component for safe HTML rendering"
```

---

## Task 4: Update `quiz-session.tsx` to use HTML rendering

**Files:**
- Modify: `app/components/quiz-session.tsx`

There are 4 render sites. Make all 4 changes before committing.

- [ ] **Step 1: Add imports at the top of `quiz-session.tsx`**

Add after the existing imports (around line 9):
```tsx
import { HtmlContent } from '@/components/html-content'
import { stripHtml } from '@/lib/html'
```

- [ ] **Step 2: Fix the score screen question text (line 120)**

Find this (inside the score screen breakdown):
```tsx
                  {flashcards[i].question}
```

Replace with:
```tsx
                  {stripHtml(flashcards[i].question)}
```

- [ ] **Step 3: Fix the active card question (line 179)**

Find this:
```tsx
        <p className="text-lg font-semibold text-slate-900 leading-relaxed flex-1">
          {card.question}
        </p>
```

Replace with:
```tsx
        <HtmlContent
          html={card.question}
          className="text-lg font-semibold text-slate-900 leading-relaxed flex-1 [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1 [&_li]:font-normal"
        />
```

- [ ] **Step 4: Fix the answer and explanation (lines 204–207)**

Find this block:
```tsx
              <p className="text-slate-800 leading-relaxed">{card.answer}</p>
              {card.explanation && (
                <p className="text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 mt-2">
                  {card.explanation}
```

Replace with:
```tsx
              <HtmlContent html={card.answer} className="text-slate-800 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1" />
              {card.explanation && (
                <HtmlContent html={card.explanation} className="text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5"
```

Then close with `/>` removing the old closing `</p>` on the next line. The full replacement block:
```tsx
              <HtmlContent html={card.answer} className="text-slate-800 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1" />
              {card.explanation && (
                <HtmlContent html={card.explanation} className="text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5" />
              )}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run from `app/`:
```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors. (Build may warn about other things — only care about errors in `quiz-session.tsx` and `html-content.tsx`.)

- [ ] **Step 6: Commit**

```bash
git add app/components/quiz-session.tsx
git commit -m "feat: render question/answer HTML in quiz session"
```

---

## Task 5: Create `lib/filter-questions.ts` with TDD

**Files:**
- Create: `app/lib/filter-questions.ts`
- Create: `app/lib/filter-questions.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/lib/filter-questions.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { filterQuestions } from './filter-questions'
import type { QuestionCard, FilterState } from './filter-questions'

const cards: QuestionCard[] = [
  {
    id: '1',
    question: '<p>What is MRS GREN?</p>',
    answer: 'answer',
    explanation: null,
    difficulty: 'EASY',
    frequency: 8,
    imageUrl: null,
    topic: { name: 'Classification' },
    topicId: 'topic-a',
    sources: [{ paper: 'p1', year: '2020', session: 'May', questionNumber: '1' }],
  },
  {
    id: '2',
    question: '<p>Aerobic vs anaerobic</p>',
    answer: 'answer',
    explanation: null,
    difficulty: 'HARD',
    frequency: 4,
    imageUrl: null,
    topic: { name: 'Respiration' },
    topicId: 'topic-b',
    sources: [{ paper: 'p2', year: '2022', session: 'Jun', questionNumber: '3' }],
  },
  {
    id: '3',
    question: '<ul><li>Option A</li><li>Option B</li></ul>',
    answer: 'answer',
    explanation: null,
    difficulty: 'MEDIUM',
    frequency: 6,
    imageUrl: null,
    topic: { name: 'Respiration' },
    topicId: 'topic-b',
    sources: [{ paper: 'p1', year: '2021', session: 'May', questionNumber: '2' }],
  },
]

const defaults: FilterState = {
  search: '',
  sort: 'frequency',
  topicId: null,
  difficulty: null,
  year: null,
}

describe('filterQuestions', () => {
  it('returns all cards sorted by frequency desc with no filters', () => {
    const result = filterQuestions(cards, defaults)
    expect(result.map((c) => c.id)).toEqual(['1', '3', '2'])
  })

  it('filters by search term, stripping HTML tags', () => {
    const result = filterQuestions(cards, { ...defaults, search: 'Option A' })
    expect(result.map((c) => c.id)).toEqual(['3'])
  })

  it('search is case-insensitive', () => {
    const result = filterQuestions(cards, { ...defaults, search: 'mrs gren' })
    expect(result.map((c) => c.id)).toEqual(['1'])
  })

  it('filters by topicId', () => {
    const result = filterQuestions(cards, { ...defaults, topicId: 'topic-b' })
    expect(result.map((c) => c.id)).toEqual(['3', '2'])
  })

  it('filters by difficulty', () => {
    const result = filterQuestions(cards, { ...defaults, difficulty: 'HARD' })
    expect(result.map((c) => c.id)).toEqual(['2'])
  })

  it('filters by year (matches any source year)', () => {
    const result = filterQuestions(cards, { ...defaults, year: '2022' })
    expect(result.map((c) => c.id)).toEqual(['2'])
  })

  it('sorts by latest source year desc when sort=year', () => {
    const result = filterQuestions(cards, { ...defaults, sort: 'year' })
    expect(result.map((c) => c.id)).toEqual(['2', '3', '1'])
  })

  it('returns empty array when no cards match', () => {
    const result = filterQuestions(cards, { ...defaults, search: 'photosynthesis' })
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- lib/filter-questions.test.ts
```

Expected: `FAIL` — `Cannot find module './filter-questions'`

- [ ] **Step 3: Implement `lib/filter-questions.ts`**

Create `app/lib/filter-questions.ts`:
```ts
import { stripHtml } from './html'

export type FlashcardSource = {
  paper: string
  year: string
  session: string
  questionNumber: string
}

export type QuestionCard = {
  id: string
  question: string
  answer: string
  explanation: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  frequency: number
  imageUrl: string | null
  topic: { name: string } | null
  topicId: string | null
  sources: FlashcardSource[]
}

export type FilterState = {
  search: string
  sort: 'frequency' | 'year'
  topicId: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null
  year: string | null
}

function maxSourceYear(sources: FlashcardSource[]): number {
  if (sources.length === 0) return 0
  return Math.max(...sources.map((s) => parseInt(s.year, 10)))
}

export function filterQuestions(cards: QuestionCard[], filters: FilterState): QuestionCard[] {
  let result = [...cards]

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter((c) => stripHtml(c.question).toLowerCase().includes(q))
  }

  if (filters.topicId) {
    result = result.filter((c) => c.topicId === filters.topicId)
  }

  if (filters.difficulty) {
    result = result.filter((c) => c.difficulty === filters.difficulty)
  }

  if (filters.year) {
    result = result.filter((c) => c.sources.some((s) => s.year === filters.year))
  }

  if (filters.sort === 'frequency') {
    result.sort((a, b) => b.frequency - a.frequency || a.id.localeCompare(b.id))
  } else {
    result.sort((a, b) => maxSourceYear(b.sources) - maxSourceYear(a.sources) || a.id.localeCompare(b.id))
  }

  return result
}
```

- [ ] **Step 4: Run tests to confirm they all pass**

```bash
npm test -- lib/filter-questions.test.ts
```

Expected: all 8 tests `PASS`.

- [ ] **Step 5: Commit**

```bash
git add app/lib/filter-questions.ts app/lib/filter-questions.test.ts
git commit -m "feat: add filterQuestions pure function with tests"
```

---

## Task 6: Create `components/answer-drawer.tsx`

**Files:**
- Create: `app/components/answer-drawer.tsx`

- [ ] **Step 1: Create the component**

Create `app/components/answer-drawer.tsx`:
```tsx
'use client'

import { useEffect } from 'react'
import type { QuestionCard } from '@/lib/filter-questions'
import { HtmlContent } from '@/components/html-content'

const DIFF_STYLES = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

type Props = {
  card: QuestionCard | null
  onClose: () => void
}

function DrawerContent({ card, onClose }: Props) {
  if (!card) return null

  // Dismiss on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const years = card.sources.map((s) => parseInt(s.year, 10))
  const minYear = years.length > 0 ? Math.min(...years) : null
  const maxYear = years.length > 0 ? Math.max(...years) : null
  const yearRange = minYear && maxYear
    ? minYear === maxYear ? String(minYear) : `${minYear}–${maxYear}`
    : null

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {card.topic && (
            <span className="text-xs text-slate-500 font-medium">{card.topic.name}</span>
          )}
          {card.frequency > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              ⭐ {card.frequency}×
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600 text-lg leading-none shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Question */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Question</p>
        <HtmlContent
          html={card.question}
          className="text-sm font-semibold text-slate-900 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1 [&_li]:font-normal [&_li]:text-slate-700"
        />
      </div>

      {card.imageUrl && (
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <img src={`/flashcard-images/${card.imageUrl}`} alt="Exam diagram" className="w-full" />
        </div>
      )}

      <div className="border-t border-slate-100" />

      {/* Answer */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Answer</p>
        <HtmlContent
          html={card.answer}
          className="text-sm text-slate-700 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1"
        />
        {card.explanation && (
          <HtmlContent
            html={card.explanation}
            className="mt-3 text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5"
          />
        )}
      </div>

      {/* Sources */}
      {card.sources.length > 0 && (
        <>
          <div className="border-t border-slate-100" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Past Paper Sources</p>
            <div className="flex flex-wrap gap-1.5">
              {card.sources.map((s, i) => (
                <span
                  key={i}
                  className="text-xs text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-0.5 font-mono"
                >
                  {s.paper} · {s.session} {s.year} Q{s.questionNumber}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="border-t border-slate-100" />

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${DIFF_STYLES[card.difficulty]}`}>
          {card.difficulty[0] + card.difficulty.slice(1).toLowerCase()}
        </span>
        {card.frequency > 0 && yearRange && (
          <span className="text-xs text-slate-500">
            Appeared {card.frequency} time{card.frequency !== 1 ? 's' : ''} in past papers ({yearRange})
          </span>
        )}
      </div>
    </div>
  )
}

export function AnswerDrawer({ card, onClose }: Props) {
  return (
    <>
      {/* Desktop: sticky right panel */}
      <div className="hidden md:block w-96 shrink-0">
        <div className="sticky top-6 bg-white rounded-2xl border border-slate-200 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {card ? (
            <DrawerContent card={card} onClose={onClose} />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm px-6 text-center">
              Click a question to see the answer
            </div>
          )}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      {card && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <DrawerContent card={card} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/answer-drawer.tsx
git commit -m "feat: add responsive AnswerDrawer (bottom sheet / right panel)"
```

---

## Task 7: Create `components/question-bank.tsx`

**Files:**
- Create: `app/components/question-bank.tsx`

This is the main client component — filter state, card list, drawer wiring. It imports the ToggleGroup installed in Task 1. Check the exact import path from `components/ui/toggle-group.tsx` before writing — the exported names may be `ToggleGroup` and `Toggle` or similar.

- [ ] **Step 1: Check the installed toggle-group component exports**

```bash
head -30 app/components/ui/toggle-group.tsx
```

Note the exported component names. If they differ from `ToggleGroup` and `Toggle`, adjust the import in Step 2 accordingly.

- [ ] **Step 2: Create the component**

Create `app/components/question-bank.tsx`:
```tsx
'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { filterQuestions, type QuestionCard, type FilterState } from '@/lib/filter-questions'
import { HtmlContent } from '@/components/html-content'
import { AnswerDrawer } from '@/components/answer-drawer'
import { ToggleGroup, Toggle } from '@/components/ui/toggle-group'

const DIFF_STYLES = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

export function QuestionBank({ flashcards }: { flashcards: QuestionCard[] }) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: 'frequency',
    topicId: null,
    difficulty: null,
    year: null,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  // Close filters popover on outside click
  useEffect(() => {
    if (!filtersOpen) return
    function handleClick(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filtersOpen])

  // Derive filter options from the full (unfiltered) dataset
  const topics = useMemo(() => {
    const map = new Map<string, string>()
    flashcards.forEach((c) => {
      if (c.topicId && c.topic) map.set(c.topicId, c.topic.name)
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [flashcards])

  const allYears = useMemo(() => {
    const set = new Set<string>()
    flashcards.forEach((c) => c.sources.forEach((s) => set.add(s.year)))
    return Array.from(set).sort((a, b) => parseInt(b) - parseInt(a))
  }, [flashcards])

  const filtered = useMemo(() => filterQuestions(flashcards, filters), [flashcards, filters])

  const selectedCard = useMemo(
    () => flashcards.find((c) => c.id === selectedId) ?? null,
    [flashcards, selectedId],
  )

  const activeFilterCount = [filters.topicId, filters.difficulty, filters.year].filter(Boolean).length

  const clearFilters = useCallback(() => {
    setFilters((f) => ({ ...f, topicId: null, difficulty: null, year: null }))
  }, [])

  return (
    <div className="flex gap-5 items-start">
      {/* Left: filter bar + list */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">

          {/* Row 1: Search + Filters button */}
          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:border-slate-400 transition-colors">
              <span className="text-slate-400 text-sm" aria-hidden="true">🔍</span>
              <input
                type="text"
                placeholder="Search questions…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <div ref={filtersRef} className="relative">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <span>⚙</span>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-slate-900 text-white rounded-full px-1.5 text-xs font-bold leading-5">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 z-10 flex flex-col gap-4">
                  {/* Topic */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Topic
                    </label>
                    <select
                      value={filters.topicId ?? ''}
                      onChange={(e) => setFilters((f) => ({ ...f, topicId: e.target.value || null }))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 bg-white"
                    >
                      <option value="">All topics</option>
                      {topics.map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Difficulty
                    </p>
                    <div className="flex gap-1">
                      {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setFilters((f) => ({ ...f, difficulty: f.difficulty === d ? null : d }))
                          }
                          className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors ${
                            filters.difficulty === d
                              ? DIFF_STYLES[d] + ' border-transparent'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {d[0] + d.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Year
                    </label>
                    <select
                      value={filters.year ?? ''}
                      onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value || null }))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 bg-white"
                    >
                      <option value="">All years</option>
                      {allYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => { clearFilters(); setFiltersOpen(false) }}
                    className="text-xs text-slate-400 hover:text-slate-600 text-left underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Sort + result count */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort</span>
            <ToggleGroup
              value={[filters.sort]}
              onValueChange={(values: string[]) => {
                const next = values[0] as FilterState['sort']
                if (next) setFilters((f) => ({ ...f, sort: next }))
              }}
            >
              <Toggle value="frequency">⭐ Most Frequent</Toggle>
              <Toggle value="year">📅 Latest Year</Toggle>
            </ToggleGroup>
            <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Row 3: Active filter pills (only when filters active) */}
          {activeFilterCount > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              {filters.topicId && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-0.5 text-xs text-slate-600">
                  {topics.find(([id]) => id === filters.topicId)?.[1]}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, topicId: null }))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Remove topic filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.difficulty && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-0.5 text-xs text-slate-600">
                  {filters.difficulty[0] + filters.difficulty.slice(1).toLowerCase()}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, difficulty: null }))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Remove difficulty filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.year && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-0.5 text-xs text-slate-600">
                  {filters.year}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, year: null }))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Remove year filter"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Question cards ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400 text-sm">
            No questions match your filters.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((card) => {
              const uniqueYears = [...new Set(card.sources.map((s) => s.year))]
                .sort((a, b) => parseInt(b) - parseInt(a))
                .slice(0, 4)
              const isSelected = card.id === selectedId

              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedId(isSelected ? null : card.id)}
                  className={`text-left bg-white rounded-2xl border p-4 transition-all hover:border-slate-400 hover:shadow-sm ${
                    isSelected ? 'border-slate-900 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {card.topic?.name ?? 'Uncategorised'}
                    </span>
                    {card.frequency > 0 && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 ml-2 shrink-0">
                        ⭐ {card.frequency}×
                      </span>
                    )}
                  </div>

                  <HtmlContent
                    html={card.question}
                    className="text-sm font-semibold text-slate-900 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-0.5 [&_li]:font-normal [&_li]:text-slate-700"
                  />

                  <div className="flex gap-2 flex-wrap items-center mt-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[card.difficulty]}`}>
                      {card.difficulty[0] + card.difficulty.slice(1).toLowerCase()}
                    </span>
                    {uniqueYears.map((y) => (
                      <span
                        key={y}
                        className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 font-mono"
                      >
                        {y}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: answer drawer */}
      <AnswerDrawer card={selectedCard} onClose={() => setSelectedId(null)} />
    </div>
  )
}
```

**Note:** If the animate-ui `ToggleGroup`/`Toggle` exports or their prop names differ from what's shown above, check `components/ui/toggle-group.tsx` and adjust. The key props needed are `value` (string array) and `onValueChange` (callback receiving string array).

- [ ] **Step 3: Commit**

```bash
git add app/components/question-bank.tsx
git commit -m "feat: add QuestionBank client component with filter/sort/drawer"
```

---

## Task 8: Create the server page

**Files:**
- Create: `app/app/dashboard/[subject]/questions/page.tsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/app/dashboard/\[subject\]/questions
```

- [ ] **Step 2: Create the page**

Create `app/app/dashboard/[subject]/questions/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { QuestionBank } from '@/components/question-bank'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = { params: Promise<{ subject: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: code } = await params
  const subject = await prisma.subject.findUnique({
    where: { code },
    select: { name: true },
  })
  return {
    title: subject
      ? `${subject.name} Questions — IGCSE FlashCards`
      : 'Questions — IGCSE FlashCards',
  }
}

export default async function QuestionsPage({ params }: Props) {
  const [session, { subject: code }] = await Promise.all([auth(), params])
  if (!session?.user?.id) redirect('/login')

  const subject = await prisma.subject.findUnique({
    where: { code },
    select: { id: true, name: true },
  })
  if (!subject) redirect('/dashboard')

  const flashcards = await prisma.flashcard.findMany({
    where: { subjectId: subject.id },
    include: {
      topic: { select: { name: true } },
      sources: {
        select: { paper: true, year: true, session: true, questionNumber: true },
      },
    },
    orderBy: { frequency: 'desc' },
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600">
          ← Dashboard
        </Link>
      </div>
      <div className="mb-6">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {subject.name}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Questions</h1>
        <p className="text-slate-500 text-sm mt-1">
          {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
        </p>
      </div>
      <QuestionBank flashcards={flashcards} />
    </main>
  )
}
```

- [ ] **Step 3: Run a production build to check for TypeScript errors**

```bash
cd app && npm run build 2>&1 | grep -E "error|Error|✓|✗" | head -40
```

Expected: no TypeScript errors. Build may show warnings about unused imports elsewhere — ignore those.

- [ ] **Step 4: Commit**

```bash
git add "app/app/dashboard/[subject]/questions/page.tsx"
git commit -m "feat: add /dashboard/[subject]/questions page"
```

---

## Task 9: Smoke-test in the browser

**Files:** None — manual verification only.

- [ ] **Step 1: Start the dev server**

```bash
cd app && npm run dev
```

- [ ] **Step 2: Navigate to the question bank**

Open `http://localhost:3000/dashboard/biology/questions` (assuming biology is seeded — its subject `code` is `0610`; try `http://localhost:3000/dashboard/0610/questions`).

Verify:
- Page loads with the question list
- Frequency badges show correctly
- Searching narrows the list
- Clicking "Filters" opens the popover with topic/difficulty/year controls
- Active filters appear as dismissable pills
- Sort toggle switches between Most Frequent and Latest Year
- Clicking a card opens the answer drawer (right panel on desktop, bottom sheet on mobile)
- ✕ button and clicking the backdrop (mobile) close the drawer

- [ ] **Step 3: Test HTML rendering in the quiz session**

Navigate to a quiz at `http://localhost:3000/dashboard/quiz/[any-attempt-id]`.

Verify:
- If any questions contain HTML (e.g. MCQ with `<ul><li>`), list items render visually, not as raw markup
- Score screen shows plain text (no HTML tags)

- [ ] **Step 4: Check mobile layout**

Open DevTools → toggle mobile viewport (< 768px).

Verify:
- The right-side drawer panel is hidden
- Clicking a question card opens the bottom sheet
- The bottom sheet can be dismissed by tapping the backdrop

- [ ] **Step 5: Final commit if any tweaks were needed**

```bash
git add -p  # stage only your tweaks
git commit -m "fix: question bank smoke-test tweaks"
```
