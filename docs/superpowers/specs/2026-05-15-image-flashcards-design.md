# Image Flashcards — Design Spec
_Date: 2026-05-15_

## Overview

Add support for flashcards that include a diagram image extracted from Cambridge IGCSE past papers. Images are served as static files from `app/public/flashcard-images/<subject>/`. The `imageUrl` field is set manually in `flashcards.json` when authoring image-dependent cards. The database stores the path; the quiz card renders it below the question text.

This is a pure display-layer + schema change — no new infrastructure, no Vercel Blob, no upload pipeline.

---

## Source Material

Extracted images live in `material/biology/image_question_extraction/` (gitignored). Three crop types are produced per visual:

| Type | Folder | Used? |
|------|--------|-------|
| Diagram only | `visual_crops/` | **Yes** — shown in flashcard |
| Diagram + question text | `question_context_crops/` | No |
| Full page render | `page_images/` | No |
| Raw embedded PNG | `embedded_images/` | No |

Filename convention: `{code}_{session}_{type}_{paper}_p{page}_visual{n}.png`
e.g. `0610_m25_qp_32_p15_visual01.png`

**Before running the seed:** manually copy `visual_crops/*.png` for the subject to `app/public/flashcard-images/<subject>/`.

---

## Architecture

Five files change, one migration is added:

| Action | Path | Change |
|--------|------|--------|
| Migrate | `app/prisma/schema.prisma` | Add `imageUrl String?` to `Flashcard` |
| Modify | `app/prisma/seed-biology.ts` | Read `imageUrl` from JSON, pass to `prisma.flashcard.create` |
| Modify | `app/app/dashboard/quiz/[attemptId]/page.tsx` | Add `imageUrl: true` to flashcard select |
| Modify | `app/components/quiz-session.tsx` | Add `imageUrl` to type + render `<img>` |
| Add | `app/public/flashcard-images/biology/*.png` | Static image assets (committed to git) |
| Update | `material/biology/flashcards.json` | Add `imageUrl` field to applicable cards |

---

## Schema — `app/prisma/schema.prisma`

```prisma
model Flashcard {
  id          String   @id @default(cuid())
  question    String   @db.Text
  answer      String   @db.Text
  explanation String?  @db.Text
  difficulty  Difficulty
  frequency   Int      @default(0)
  imageUrl    String?  // relative to public/flashcard-images/, e.g. "biology/0610_m25_qp_32_p15_visual01.png"
  subjectId   String
  topicId     String
  ...
}
```

Run `npx prisma migrate dev --name add-flashcard-image-url` then `npx prisma generate`.

---

## `flashcards.json` format

```json
{
  "topic": "Cell Biology",
  "question": "The diagram shows a cross-section of a leaf. Identify structures A, B and C and state the function of B.",
  "imageUrl": "biology/0610_m25_qp_32_p15_visual01.png",
  "answer": "A = upper epidermis; B = palisade mesophyll; C = spongy mesophyll. Function of B: contains many chloroplasts for photosynthesis.",
  "explanation": null,
  "difficulty": "MEDIUM",
  "frequency": 3,
  "yearsAsked": ["2022", "2023", "2025"],
  "sources": [...]
}
```

Cards without images omit `imageUrl` entirely (or set `null`). The filename is taken directly from `visual_crops/` in the extraction folder.

---

## Seed script — `app/prisma/seed-biology.ts`

Add `imageUrl` to the `prisma.flashcard.create` call:

```ts
await prisma.flashcard.create({
  data: {
    question: card.question,
    answer: card.answer,
    explanation: card.explanation ?? null,
    difficulty: card.difficulty,
    frequency: card.frequency,
    imageUrl: card.imageUrl ?? null,   // ← new
    subjectId,
    topicId: topicMap[card.topic],
    sources: { create: card.sources.map(...) },
  }
})
```

No other seed changes required.

---

## Server page — `app/app/dashboard/quiz/[attemptId]/page.tsx`

Add `imageUrl` to the flashcard `select`:

```ts
flashcard: {
  select: {
    id: true,
    question: true,
    answer: true,
    explanation: true,
    difficulty: true,
    frequency: true,
    imageUrl: true,   // ← new
    sources: { select: { paper: true, year: true, session: true, questionNumber: true } },
  }
}
```

---

## Quiz card UI — `app/components/quiz-session.tsx`

**Type update:**
```ts
type Flashcard = {
  id: string
  question: string
  answer: string
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  frequency: number
  imageUrl: string | null   // ← new
  sources: FlashcardSource[]
}
```

**Render — between question text and Reveal button:**
```tsx
{card.imageUrl && (
  <div className="rounded-xl border border-slate-100 overflow-hidden mt-4">
    <img
      src={`/flashcard-images/${card.imageUrl}`}
      alt="Exam diagram"
      className="w-full"
    />
  </div>
)}
```

The diagram remains visible after the answer is revealed (the image block stays in the DOM throughout). No hiding/toggling needed.

---

## Image storage convention

```
app/public/
└── flashcard-images/
    └── biology/
        ├── 0610_m25_qp_12_p03_visual01.png
        ├── 0610_m25_qp_32_p15_visual01.png
        └── ...
```

- Committed to git — no `.gitignore` entry needed
- Served by Next.js at `/flashcard-images/<subject>/<filename>`
- Future subjects get their own subfolder: `chemistry/`, `physics/`, etc.
- Source: copy from `material/<subject>/image_question_extraction/visual_crops/`

---

## Out of scope

- Automated image-to-card linking (done manually via `imageUrl` in JSON)
- `question_context_crops` or `page_images` are not used
- Vercel Blob or any CDN upload pipeline
- Image display on the dashboard or results screen
- Multi-image cards (one image per card maximum)
