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
