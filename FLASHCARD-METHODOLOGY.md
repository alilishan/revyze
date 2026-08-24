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

There is **one seed script for every subject** — `app/prisma/seed.ts`. It holds a registry of all eight
IGCSE subjects and reads `material/<dir>/flashcards.json` for each. You do not write a seed script per
subject; you only drop the JSON in the right folder.

```bash
cd app

npx prisma db seed                            # subjects + every subject that has a flashcards.json
npx tsx prisma/seed.ts --subject chemistry    # one subject only
npx tsx prisma/seed.ts --subject chemistry --force  # wipe that subject and re-seed
```

A subject with no `flashcards.json` is skipped with a log line, so running the seed early is safe.

The registry lives at the top of `seed.ts`. Each entry maps a Cambridge code to a material directory:

```ts
{ name: "Chemistry", code: "0620", dir: "chemistry", description: "Cambridge IGCSE Chemistry" }
```

---

## Adding a New Subject

1. **Create the material folder**: `material/<subject-name>/` — the name must match the `dir` field in the
   `SUBJECTS` registry in `app/prisma/seed.ts` (all eight subjects are already registered)
2. **Copy in the past papers**: QP + MS PDFs for all available years, plus the current syllabus PDF
3. **Generate the JSON**: follow the pipeline below; save as `material/<subject-name>/flashcards.json`
4. **Run the seed**: `cd app && npx tsx prisma/seed.ts --subject <subject-name>`

No new seed script, no README change — the unified seeder picks the subject up from its registry entry.

---

## The Extraction Pipeline

Reading forty-odd PDFs in a single pass does not scale past one subject. Run it in stages instead, with
each stage's output on disk so a failure costs one paper rather than the whole set.

**Stage 0 — choose the papers.** Aim for ~22 QP+MS pairs: the core theory and extended theory papers of one
session per year across ten years. Check the paper numbering for the whole range before you start —
Cambridge renumbers papers. For Chemistry (0620), Paper 2 was core theory and Paper 3 extended theory
before 2016; from 2016 it is Paper 3 core and Paper 4 extended. Getting this wrong inverts every difficulty
label for the affected years. Also check the session actually exists: 0620 has no May/June 2025 papers,
only March.

**Stage 1 — extract text.** `pdftotext -layout` each PDF into `material/<subject>/extracted/`. Deterministic,
fast, and it makes the QP+MS pairing explicit before any model reads anything.

**Stage 2 — one pass per paper pair.** Each pass reads one QP + its MS and writes candidate cards to
`material/<subject>/candidates/<paper>_<session><yy>.json`, with `frequency: 1`, a single-year `yearsAsked`,
and exact source references. These passes are independent, so they parallelise across agents. Give every
pass the same fixed list of allowed `topic` values, taken from the syllabus — otherwise the same concept
lands under three different topic names and the merge cannot see the duplicates.

**Stage 3 — merge and count frequency.** Group candidates by underlying concept, keep one canonical card per
concept, and compute `frequency` and `yearsAsked` from the merged source list. Shard this by topic group so
each pass holds a manageable number of cards. This stage is where the frequency numbers become real —
never estimate them in stage 2.

**Stage 4 — validate.** Check the merged set against the checklist below before writing `flashcards.json`.

### Diagram cards

Questions that only make sense with their figure are skipped by the text pipeline and picked up by a
separate pass. `material/<subject>/IGCSE <Subject> Past Papers/extract_<subject>_visual_questions.py`
segments each question paper by question number, finds the figures, and crops them;
`material/<subject>/prepare_visual_images.py` then drops unusable crops, converts to webp and stages them
in `app/public/flashcard-images/<subject>/`. Cards reference them through the `imageUrl` field.

Two things the Chemistry run established, both of which cost a rebuild to discover:

**Find figures from non-text ink, not from whitespace.** The original Biology extractor looked for the
largest vertical gap between sentences and assumed a diagram sat in it. That fails on ruled tables and
apparatus drawings packed against prose - it cut table headers off and bled into the following
sub-question. Render the page, mask every text bounding box, and treat the remaining dark pixels as
graphical content; contiguous rows of it are the figure. Then correct for the two side effects: masking
also erases atom labels and axis ticks inside the figure, so grow the band back over any *short* text that
sits horizontally inside it, and judge that per rendered line rather than per text run, because pdftohtml
splits one sentence into several short fragments. Exclude the page margins first - the "DO NOT WRITE IN
THIS MARGIN" rules are graphical and produce blank crops.

**Question numbers are not always separate text items.** Some sessions emit "1  Using numbers only, state
the:" as a single item instead of a bare "1" in the margin. Matching only bare numbers silently drops
whole questions and silently merges their pages into the previous question. Accept an inline leading
number too, but only when it continues the expected sequence, or numbered answer lines start splitting
questions.

No mechanical filter reliably separates a sparse line diagram from an empty answer space - both are mostly
white, and dotted answer lines register as ink across the whole crop. Let the card-writing pass discard
crops that show no figure; it has to look at the image anyway.

### Topic naming

Take `topic` values from the syllabus **subtopic** headings with the numbers stripped ("Ions and ionic
bonds", "Rate of reaction"), not the dozen top-level headings — those are too coarse to filter a quiz by.
Check the current syllabus against the one in force when the older papers were sat, and drop concepts that
have since been retired from the specification.

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
- [ ] Seed runs cleanly from `app/` with `npx tsx prisma/seed.ts --subject <subject>`
