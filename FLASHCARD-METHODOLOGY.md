# Flashcard Generation Methodology

How to produce a high-quality, exam-calibrated flashcard set for any IGCSE subject from past papers.

## Overview

Flashcards are derived from Cambridge IGCSE past papers — question papers (QP) and mark schemes (MS) together. The goal is not to transcribe individual questions verbatim, but to identify the underlying **concepts** that appear repeatedly across years and distil them into clean question/answer pairs.

Each card carries:
- `question` — the concept as a direct question
- `answer` — the mark-scheme-level correct answer
- `explanation` — additional context, common misconceptions, or memory aids
- `difficulty` — `EASY`, `MEDIUM`, or `HARD`
- `frequency` — how many times this concept has appeared across all years analysed
- `yearsAsked` — list of years (e.g. `["2018", "2019", "2022"]`)
- `sources` — array of exact paper references (paper code, year, session, question number)
- `topic` — the syllabus topic this concept belongs to

---

## Source Material

### Folder structure

```
material/
└── <subject-name>/          e.g. biology/
    ├── flashcards.json      generated output
    ├── flashcards-summary.md  human-readable breakdown (optional)
    └── <raw PDFs>           past papers (gitignored)
```

The `material/` folder is gitignored — raw PDFs are never committed.

### Which papers to include

For best frequency coverage, include:
- **All available years** — aim for at least 10 years (e.g. 2015–2025)
- **Both question paper and mark scheme** for each sitting — answers are only accurate when the MS is read alongside the QP
- **Multiple papers per sitting** — Cambridge typically offers Paper 2 (core) and Paper 3 (extended); include both where available
- **Both sessions** if the subject has May/June and October/November variants

For Biology (0610) the following were used:
- Papers 22 and 32, May/June session, 2015–2025 (44 PDFs total)

---

## Process

### Step 1 — Read the syllabus first

Download the Cambridge IGCSE syllabus PDF for the subject. Map out all topic headings. These become the `topic` values in the JSON. Having consistent topic names from the start prevents fragmentation later.

### Step 2 — First pass: extract question/answer pairs

For each PDF pair (QP + MS):
1. Work through the QP question by question.
2. For each question, find the corresponding mark scheme entry.
3. Ask: **does this test a discrete, reusable concept?** If yes, write a card.
4. Write the `question` in the form a student would encounter: "What is…?", "Explain why…", "State the function of…"
5. Write the `answer` using mark-scheme language — precise, concise, bullet-point style where appropriate.
6. Note the source: paper code, year, session (`MJ` = May/June, `ON` = October/November), question number.

Not every mark-scheme point becomes its own card. Combine related sub-parts if they test the same concept.

### Step 3 — Cross-year frequency analysis

After extracting all concepts, group cards by similarity across years. When the same underlying concept appears in multiple years:
1. **Merge into one card** — one canonical question/answer for the concept.
2. Set `frequency` to the total number of times it appeared.
3. Add every year to `yearsAsked`.
4. Add every paper reference to `sources`.

This is the most important step. A concept with `frequency: 9` has appeared in 9 out of 11 years — it is near-certain exam material. A concept with `frequency: 1` is lower priority.

### Step 4 — Assign difficulty

Use these heuristics:

| Difficulty | Criteria |
|---|---|
| `EASY` | Recall of a single fact or definition; one-mark question on the MS; appears in core (Paper 2) |
| `MEDIUM` | Requires understanding of a process or relationship; 2–3 mark question; appears in both core and extended |
| `HARD` | Application, analysis, or evaluation; extended only (Paper 3); 4+ marks or requires multi-step reasoning |

When in doubt, check which paper the question came from: Paper 2 (core) → lean Easy/Medium, Paper 3 (extended) → lean Medium/Hard.

### Step 5 — Write explanations

The `explanation` field is optional but valuable. Add one when:
- There is a common student misconception to address
- The answer requires a nuance that the mark scheme alone doesn't convey
- A memory aid or analogy would help

Keep explanations to 1–3 sentences.

### Step 6 — Review and balance

Before finalising the JSON:
- Check topic distribution — no single topic should have more than ~30% of cards
- Check difficulty distribution — aim for roughly 30% Easy, 50% Medium, 20% Hard
- Remove duplicates (same concept, slightly different phrasing)
- Verify that every `HARD` card is genuinely hard, not just obscure

---

## Output Format

Save the final set as `material/<subject-name>/flashcards.json`. Each entry follows this schema:

```json
{
  "topic": "Respiration",
  "question": "State the equation for aerobic respiration.",
  "answer": "glucose + oxygen → carbon dioxide + water (+ energy released as ATP)",
  "explanation": "The equation must include all four components. Energy is often expected as 'ATP' rather than just 'energy'.",
  "difficulty": "EASY",
  "frequency": 9,
  "yearsAsked": ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2024"],
  "sources": [
    { "paper": "0610/22", "year": "2017", "session": "MJ", "questionNumber": "3a" },
    { "paper": "0610/32", "year": "2019", "session": "MJ", "questionNumber": "2b" }
  ]
}
```

---

## Seeding the Database

Once the JSON is ready:

```bash
cd app

# First time
npx tsx prisma/seed-<subject>.ts

# Wipe and re-seed
npx tsx prisma/seed-<subject>.ts --force
```

The seed script must:
1. Find the `Subject` record by its Cambridge code (e.g. `"0610"` for Biology).
2. Create one `Topic` record per unique topic name and build a `topicMap`.
3. Insert each `Flashcard` with `frequency`, `subjectId`, `topicId`, and nested `sources`.

See `app/prisma/seed-biology.ts` as the reference implementation.

---

## Adding a New Subject

1. **Create the material folder**: `material/<subject-name>/`
2. **Copy in the past papers**: QP + MS PDFs for all available years
3. **Generate the JSON**: follow Steps 1–6 above; save as `material/<subject-name>/flashcards.json`
4. **Check the subject exists in the DB**: run `npx prisma db seed` if you have not already (it seeds all 8 IGCSE subjects by their Cambridge codes)
5. **Copy the seed script**: copy `app/prisma/seed-biology.ts` → `app/prisma/seed-<subject>.ts`
   - Change the `findFirst` query to match the new subject's Cambridge code
   - Update the script header comment
6. **Run the seed**: `npx tsx prisma/seed-<subject>.ts`
7. **Add the seed command to `README.md`** under the Database section

### Supported subjects and codes

| Subject | Code |
|---|---|
| Mathematics | 0580 |
| Physics | 0625 |
| Chemistry | 0620 |
| Biology | 0610 |
| English Language | 0500 |
| Computer Science | 0478 |
| History | 0470 |
| Geography | 0460 |

---

## Quality Checklist

Before committing a new flashcard set, verify:

- [ ] Every card has been cross-checked against its mark scheme (no invented answers)
- [ ] `frequency` reflects actual cross-year count, not an estimate
- [ ] `sources` array is populated for all high-frequency cards
- [ ] Topic names match the official Cambridge syllabus headings
- [ ] Difficulty distribution is roughly 30 / 50 / 20 (Easy / Medium / Hard)
- [ ] No card has an empty `answer`
- [ ] `explanation` field is `null` (not an empty string) when unused
- [ ] Seed script runs cleanly from `app/` with `npx tsx prisma/seed-<subject>.ts`
