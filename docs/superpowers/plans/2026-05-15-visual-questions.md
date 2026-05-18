# Visual Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed 563 image-backed past-paper questions from the manifest into the database and display their diagrams in the quiz card UI.

**Architecture:** Add `imageUrl String?` to the `Flashcard` schema, copy 682 WebP images to `app/public/flashcard-images/biology/`, seed the manifest entries as a new topic under Biology, then update the quiz page + component to fetch and render the image between the question text and the Reveal button.

**Tech Stack:** Prisma 6, MySQL, Next.js 16 App Router, React 19, Tailwind CSS v4, Vitest, TypeScript, `npx tsx` for seed scripts.

---

## File map

| Action | Path | Change |
|--------|------|--------|
| Copy assets | `app/public/flashcard-images/biology/*.webp` | 682 new static files |
| Migrate | `app/prisma/schema.prisma` | Add `imageUrl String?` to `Flashcard` |
| Create | `app/prisma/seed-visual-questions.ts` | New seed script for manifest data |
| Create | `app/prisma/seed-visual-questions.test.ts` | Unit tests for helper functions |
| Modify | `app/app/dashboard/quiz/[attemptId]/page.tsx` | Add `imageUrl` to flashcard select |
| Modify | `app/components/quiz-session.tsx` | Add `imageUrl` to type + render image |

---

## Task 1: Copy images into the public directory

**Files:**
- Create: `app/public/flashcard-images/biology/` (directory + 682 `.webp` files)

- [ ] **Step 1: Create the directory and copy all WebP images**

Run from repo root:
```bash
mkdir -p app/public/flashcard-images/biology
cp "material/biology/IGCSE Biology Past Papers/biology_visual_questions_2020_2025/images/"*.webp \
   app/public/flashcard-images/biology/
```

- [ ] **Step 2: Verify count and total size**

```bash
ls app/public/flashcard-images/biology/ | wc -l   # expect 682
du -sh app/public/flashcard-images/biology/        # expect ~18 MB
```

- [ ] **Step 3: Commit**

```bash
git add app/public/flashcard-images/
git commit -m "feat: add 682 biology visual question images (WebP)"
```

---

## Task 2: Schema migration — add imageUrl to Flashcard

**Files:**
- Modify: `app/prisma/schema.prisma` — `Flashcard` model

- [ ] **Step 1: Add the field to the schema**

In `app/prisma/schema.prisma`, update the `Flashcard` model to add `imageUrl` after `frequency`:

```prisma
model Flashcard {
  id          String     @id @default(cuid())
  question    String     @db.Text
  answer      String     @db.Text
  explanation String?    @db.Text
  difficulty  Difficulty @default(MEDIUM)
  frequency   Int        @default(0)
  imageUrl    String?
  subjectId   String
  topicId     String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  subject        Subject             @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  topic          Topic?              @relation(fields: [topicId], references: [id], onDelete: SetNull)
  quizFlashcards QuizFlashcard[]
  attemptAnswers QuizAttemptAnswer[]
  sources        FlashcardSource[]
}
```

- [ ] **Step 2: Run the migration**

```bash
cd app
npx prisma migrate dev --name add-flashcard-image-url
```

Expected output:
```
✔ Generated Prisma Client
The following migration(s) have been applied:
  migrations/XXXXXXXX_add_flashcard_image_url/migration.sql
```

- [ ] **Step 3: Confirm migration SQL is correct**

```bash
cat app/prisma/migrations/$(ls app/prisma/migrations | grep add_flashcard_image_url)/migration.sql
```

Expected:
```sql
ALTER TABLE `Flashcard` ADD COLUMN `imageUrl` VARCHAR(191) NULL;
```

- [ ] **Step 4: Commit**

```bash
git add app/prisma/schema.prisma app/prisma/migrations/
git commit -m "feat: add imageUrl field to Flashcard schema"
```

---

## Task 3: Seed script for visual questions

**Files:**
- Create: `app/prisma/seed-visual-questions.ts`
- Create: `app/prisma/seed-visual-questions.test.ts`

The script reads `manifest.json`, skips entries with no answer, creates a single topic "Past Paper Visual Questions" under Biology, and seeds one `Flashcard` per manifest entry with `imageUrl` set to the first image file for that entry.

Helper functions to extract/clean data are kept pure so they can be unit-tested without a DB.

### Sub-task 3a: Write and verify the helper tests first

- [ ] **Step 1: Write the test file**

Create `app/prisma/seed-visual-questions.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { stripLeadingNumber, parsePaperMeta, primaryImageUrl } from "./seed-visual-questions"

describe("stripLeadingNumber", () => {
  it("removes leading question number", () => {
    expect(stripLeadingNumber("5 The diagram shows a cell.")).toBe("The diagram shows a cell.")
  })
  it("handles two-digit question numbers", () => {
    expect(stripLeadingNumber("12 The graph shows temperature.")).toBe("The graph shows temperature.")
  })
  it("leaves text unchanged when no leading number", () => {
    expect(stripLeadingNumber("No number here.")).toBe("No number here.")
  })
})

describe("parsePaperMeta", () => {
  it("parses March paper", () => {
    expect(parsePaperMeta("0610_m22_qp_12.pdf")).toEqual({
      paper: "0610/12",
      year: "2022",
      session: "March",
    })
  })
  it("parses June paper", () => {
    expect(parsePaperMeta("0610_s21_qp_31.pdf")).toEqual({
      paper: "0610/31",
      year: "2021",
      session: "June",
    })
  })
  it("parses November paper", () => {
    expect(parsePaperMeta("0610_w20_qp_42.pdf")).toEqual({
      paper: "0610/42",
      year: "2020",
      session: "November",
    })
  })
})

describe("primaryImageUrl", () => {
  it("returns biology-prefixed webp path from first image_file", () => {
    expect(primaryImageUrl(["images/0610_m20_qp_12_q5_p3_seg1.webp"])).toBe(
      "biology/0610_m20_qp_12_q5_p3_seg1.webp"
    )
  })
  it("uses first file when multiple exist", () => {
    expect(primaryImageUrl(["images/first.webp", "images/second.webp"])).toBe("biology/first.webp")
  })
  it("returns null for empty array", () => {
    expect(primaryImageUrl([])).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — expect them to fail (functions not yet exported)**

```bash
cd app
npm test -- prisma/seed-visual-questions.test.ts
```

Expected: FAIL — `Cannot find module './seed-visual-questions'`

### Sub-task 3b: Write the seed script with exported helpers

- [ ] **Step 3: Create the seed script**

Create `app/prisma/seed-visual-questions.ts`:

```typescript
/**
 * Seeds IGCSE Biology visual-question flashcards from the past-paper manifest.
 *
 * Run from app/:
 *   npx tsx prisma/seed-visual-questions.ts
 *
 * Skips entries without answers. Creates topic "Past Paper Visual Questions".
 * If that topic already exists, exits safely.
 * To wipe and re-seed visual questions only:
 *   npx tsx prisma/seed-visual-questions.ts --force
 */
import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

// ── Pure helpers (exported for testing) ───────────────────────────────────

export function stripLeadingNumber(text: string): string {
  return text.replace(/^\d+\s+/, "")
}

const SESSION_MAP: Record<string, string> = { m: "March", s: "June", w: "November" }

export function parsePaperMeta(paperFile: string): {
  paper: string
  year: string
  session: string
} {
  // e.g. "0610_m22_qp_12.pdf"
  const m = paperFile.match(/^(\d+)_([msw])(\d{2})_qp_(\d+)\.pdf$/)
  if (!m) return { paper: paperFile, year: "unknown", session: "unknown" }
  const [, code, sessionChar, yearShort, paperNum] = m
  return {
    paper: `${code}/${paperNum}`,
    year: `20${yearShort}`,
    session: SESSION_MAP[sessionChar] ?? "unknown",
  }
}

export function primaryImageUrl(imageFiles: string[]): string | null {
  if (imageFiles.length === 0) return null
  const filename = imageFiles[0].replace(/^images\//, "")
  return `biology/${filename}`
}

// ── Manifest types ────────────────────────────────────────────────────────

type ManifestEntry = {
  id: string
  year: number
  paper_file: string
  question_number: string
  question_text: string
  image_files: string[]
  answer: string | null
}

type Manifest = {
  entries: ManifestEntry[]
}

// ── Main ──────────────────────────────────────────────────────────────────

const TOPIC_NAME = "Past Paper Visual Questions"

async function main() {
  const force = process.argv.includes("--force")

  const manifestPath = join(
    process.cwd(),
    "../material/biology/IGCSE Biology Past Papers/biology_visual_questions_2020_2025/manifest.json"
  )
  const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf-8"))

  const biology = await prisma.subject.findFirst({ where: { code: "0610" } })
  if (!biology) {
    throw new Error('Biology subject not found. Run "npx prisma db seed" first.')
  }

  // Guard: check if topic already exists
  const existingTopic = await prisma.topic.findFirst({
    where: { name: TOPIC_NAME, subjectId: biology.id },
  })

  if (existingTopic) {
    if (!force) {
      const count = await prisma.flashcard.count({ where: { topicId: existingTopic.id } })
      console.log(
        `"${TOPIC_NAME}" already has ${count} flashcards — skipping. Use --force to wipe and re-seed.`
      )
      return
    }
    await prisma.flashcard.deleteMany({ where: { topicId: existingTopic.id } })
    await prisma.topic.delete({ where: { id: existingTopic.id } })
    console.log(`Cleared existing "${TOPIC_NAME}" topic and its flashcards.`)
  }

  const topic = await prisma.topic.create({
    data: { name: TOPIC_NAME, subjectId: biology.id },
  })

  // Only seed entries that have an answer
  const seeding = manifest.entries.filter((e) => e.answer !== null)
  const skipped = manifest.entries.length - seeding.length
  console.log(`Seeding ${seeding.length} entries (${skipped} skipped — no answer).`)

  let seeded = 0

  for (const entry of seeding) {
    const { paper, year, session } = parsePaperMeta(entry.paper_file)
    const imageUrl = primaryImageUrl(entry.image_files)
    const question = stripLeadingNumber(entry.question_text)

    await prisma.flashcard.create({
      data: {
        question,
        answer: entry.answer!,
        explanation: null,
        difficulty: "MEDIUM",
        frequency: 1,
        imageUrl,
        subjectId: biology.id,
        topicId: topic.id,
        sources: {
          create: [{ paper, year, session, questionNumber: entry.question_number }],
        },
      },
    })
    seeded++
  }

  console.log(`✓ Seeded ${seeded} visual-question flashcards.`)
  console.log(`  Topic: "${TOPIC_NAME}"`)
  console.log(`  Subject: Biology (0610)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 4: Run tests — expect them to pass**

```bash
cd app
npm test -- prisma/seed-visual-questions.test.ts
```

Expected:
```
✓ prisma/seed-visual-questions.test.ts (6)
  ✓ stripLeadingNumber > removes leading question number
  ✓ stripLeadingNumber > handles two-digit question numbers
  ✓ stripLeadingNumber > leaves text unchanged when no leading number
  ✓ parsePaperMeta > parses March paper
  ✓ parsePaperMeta > parses June paper
  ✓ parsePaperMeta > parses November paper
  ✓ primaryImageUrl > returns biology-prefixed webp path from first image_file
  ✓ primaryImageUrl > uses first file when multiple exist
  ✓ primaryImageUrl > returns null for empty array
```

- [ ] **Step 5: Run the seed script (dry check first)**

```bash
cd app
npx tsx prisma/seed-visual-questions.ts
```

Expected output:
```
Seeding 563 entries (3 skipped — no answer).
✓ Seeded 563 visual-question flashcards.
  Topic: "Past Paper Visual Questions"
  Subject: Biology (0610)
```

- [ ] **Step 6: Commit**

```bash
git add app/prisma/seed-visual-questions.ts app/prisma/seed-visual-questions.test.ts
git commit -m "feat: add seed script for biology visual-question flashcards"
```

---

## Task 4: Update quiz page — add imageUrl to select

**Files:**
- Modify: `app/app/dashboard/quiz/[attemptId]/page.tsx`

- [ ] **Step 1: Add `imageUrl` to the flashcard select**

In `app/app/dashboard/quiz/[attemptId]/page.tsx`, update the flashcard select block (lines 30–44):

```typescript
flashcard: {
  select: {
    id: true,
    question: true,
    answer: true,
    explanation: true,
    difficulty: true,
    frequency: true,
    imageUrl: true,
    sources: {
      select: {
        paper: true,
        year: true,
        session: true,
        questionNumber: true,
      },
    },
  },
},
```

- [ ] **Step 2: Commit**

```bash
git add app/app/dashboard/quiz/[attemptId]/page.tsx
git commit -m "feat: include imageUrl in quiz flashcard select"
```

---

## Task 5: Update QuizSession component — render image

**Files:**
- Modify: `app/components/quiz-session.tsx`

- [ ] **Step 1: Add `imageUrl` to the `Flashcard` type**

In `app/components/quiz-session.tsx`, update the `Flashcard` type (currently at line 17):

```typescript
type Flashcard = {
  id: string
  question: string
  answer: string
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  frequency: number
  imageUrl: string | null
  sources: FlashcardSource[]
}
```

- [ ] **Step 2: Render the image between question text and the Reveal button**

In the active-card section, the question `<p>` is followed immediately by the reveal/answer block. Add the image block between them. Replace the existing question + reveal section (lines 177–244) with:

```tsx
{/* Question */}
<p className="text-lg font-semibold text-slate-900 leading-relaxed flex-1">
  {card.question}
</p>

{/* Diagram — shown before and after reveal */}
{card.imageUrl && (
  <div className="rounded-xl border border-slate-100 overflow-hidden mt-4">
    <img
      src={`/flashcard-images/${card.imageUrl}`}
      alt="Exam diagram"
      className="w-full"
    />
  </div>
)}

{/* Reveal / Answer area */}
{!revealed ? (
  <Button className="mt-6 w-full" onClick={() => setRevealed(true)}>
    Reveal Answer
  </Button>
) : (
  <div className="mt-6 space-y-5">
    <div className="border-t border-slate-100 pt-4 space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        Answer
      </p>
      <p className="text-slate-800 leading-relaxed">{card.answer}</p>
      {card.explanation && (
        <p className="text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 mt-2">
          {card.explanation}
        </p>
      )}

      {card.frequency > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Exam frequency
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              ⭐ {card.frequency}× in past papers
            </span>
          </div>

          {card.sources.length > 0 && (
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
          )}
        </div>
      )}
    </div>

    <div className="flex gap-3 pt-1">
      <Button
        variant="destructive"
        className="flex-1"
        onClick={() => handleAnswer(false)}
        disabled={saving}
      >
        ✗ Missed it
      </Button>
      <Button
        className="flex-1"
        onClick={() => handleAnswer(true)}
        disabled={saving}
      >
        ✓ Got it!
      </Button>
    </div>
  </div>
)}
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd app
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors.

- [ ] **Step 4: Start dev server and manually test a visual-question card**

```bash
cd app
npm run dev
```

1. Log in and start a quiz with Biology subject
2. Confirm cards without `imageUrl` render exactly as before
3. Confirm cards with `imageUrl` show the diagram below the question, above the Reveal button
4. Confirm the diagram stays visible after clicking Reveal
5. Confirm "Got it / Missed it" still submits correctly

- [ ] **Step 5: Commit**

```bash
git add app/components/quiz-session.tsx
git commit -m "feat: render diagram image in quiz card when imageUrl is present"
```

---

## Self-review checklist

- [x] **Spec coverage:** schema ✓, image copy ✓, seed script ✓, quiz page select ✓, quiz UI ✓
- [x] **No placeholders:** all steps have complete code
- [x] **Type consistency:** `imageUrl: string | null` in both `Flashcard` type (quiz-session) and Prisma select matches the `String?` schema field
- [x] **Guard clause:** seed skips if topic exists unless `--force` — does NOT touch existing 145 Biology concept cards
- [x] **Image path:** `primaryImageUrl` returns `biology/filename.webp`; rendered as `/flashcard-images/biology/filename.webp` — matches `public/flashcard-images/biology/` directory
