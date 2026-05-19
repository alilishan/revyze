/**
 * Unified seed script — subjects + flashcards.
 *
 * Run from app/:
 *   npx prisma db seed          # seed subjects + all available flashcard sets
 *   npx tsx prisma/seed.ts      # same
 *   npx tsx prisma/seed.ts --force            # wipe + re-seed every subject
 *   npx tsx prisma/seed.ts --subject biology  # seed (or re-seed with --force) one subject
 *
 * Flashcard data is read from material/<dir>/flashcards.json.
 * Add a new subject by adding an entry below and dropping its flashcards.json.
 */
import { PrismaClient, type Difficulty } from "@prisma/client"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

// ── Subject registry ──────────────────────────────────────────────────────────

const SUBJECTS = [
  { name: "Biology",          code: "0610", dir: "biology",          description: "Cambridge IGCSE Biology" },
  { name: "Physics",          code: "0625", dir: "physics",          description: "Cambridge IGCSE Physics" },
  { name: "Chemistry",        code: "0620", dir: "chemistry",        description: "Cambridge IGCSE Chemistry" },
  { name: "Mathematics",      code: "0580", dir: "mathematics",      description: "Cambridge IGCSE Mathematics" },
  { name: "Computer Science", code: "0478", dir: "computer-science", description: "Cambridge IGCSE Computer Science" },
  { name: "English Language", code: "0500", dir: "english-language", description: "Cambridge IGCSE English as a First Language" },
  { name: "History",          code: "0470", dir: "history",          description: "Cambridge IGCSE History" },
  { name: "Geography",        code: "0460", dir: "geography",        description: "Cambridge IGCSE Geography" },
] as const

type SubjectEntry = (typeof SUBJECTS)[number]

// ── Card shape from flashcards.json ──────────────────────────────────────────

type CardSource = {
  paper: string
  year: string
  session: string
  questionNumber: string
}

type Card = {
  topic: string
  question: string
  answer: string
  explanation: string | null
  difficulty: Difficulty
  frequency: number
  yearsAsked: string[]
  sources: CardSource[]
  imageUrl?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function materialPath(dir: string) {
  return join(process.cwd(), `../material/${dir}/flashcards.json`)
}

function loadCards(dir: string): Card[] | null {
  const path = materialPath(dir)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, "utf-8")) as Card[]
}

async function seedSubjectCards(subject: SubjectEntry, subjectId: string, force: boolean) {
  const cards = loadCards(subject.dir)
  if (!cards) {
    console.log(`  [${subject.name}] No flashcards.json found — skipping cards.`)
    return
  }

  const existing = await prisma.flashcard.count({ where: { subjectId } })

  if (existing > 0) {
    if (!force) {
      console.log(`  [${subject.name}] ${existing} cards already seeded — skipping. Use --force to re-seed.`)
      return
    }
    await prisma.flashcard.deleteMany({ where: { subjectId } })
    await prisma.topic.deleteMany({ where: { subjectId } })
    console.log(`  [${subject.name}] Cleared ${existing} existing cards.`)
  }

  // Topics
  const topicNames = [...new Set(cards.map((c) => c.topic))].sort()
  const topicMap: Record<string, string> = {}
  for (const name of topicNames) {
    const topic = await prisma.topic.create({ data: { name, subjectId } })
    topicMap[name] = topic.id
  }

  // Flashcards + sources
  let sourceCount = 0
  for (const card of cards) {
    await prisma.flashcard.create({
      data: {
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        difficulty: card.difficulty,
        frequency: card.frequency,
        imageUrl: card.imageUrl ?? null,
        subjectId,
        topicId: topicMap[card.topic],
        ...(card.sources.length > 0 && {
          sources: {
            create: card.sources.map((s) => ({
              paper: s.paper,
              year: s.year,
              session: s.session,
              questionNumber: s.questionNumber,
            })),
          },
        }),
      },
    })
    sourceCount += card.sources.length
  }

  const byDiff = cards.reduce(
    (acc, c) => ({ ...acc, [c.difficulty]: (acc[c.difficulty] ?? 0) + 1 }),
    {} as Record<string, number>
  )

  console.log(
    `  [${subject.name}] ✓ ${cards.length} cards | ${topicNames.length} topics | ${sourceCount} sources` +
    `  (Easy ${byDiff.EASY ?? 0} / Medium ${byDiff.MEDIUM ?? 0} / Hard ${byDiff.HARD ?? 0})`
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const force = process.argv.includes("--force")
  const subjectArg = process.argv.find((a) => a.startsWith("--subject="))?.split("=")[1]
    ?? (process.argv.indexOf("--subject") !== -1
        ? process.argv[process.argv.indexOf("--subject") + 1]
        : undefined)

  const targets = subjectArg
    ? SUBJECTS.filter((s) => s.dir === subjectArg || s.code === subjectArg || s.name.toLowerCase() === subjectArg.toLowerCase())
    : [...SUBJECTS]

  if (subjectArg && targets.length === 0) {
    console.error(`Unknown subject "${subjectArg}". Valid dirs: ${SUBJECTS.map((s) => s.dir).join(", ")}`)
    process.exit(1)
  }

  // 1. Upsert subjects
  console.log("Seeding subjects…")
  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: { name: subject.name, code: subject.code, description: subject.description },
    })
  }
  console.log(`✓ ${SUBJECTS.length} subjects ready.\n`)

  // 2. Seed flashcards for each target
  console.log("Seeding flashcards…")
  for (const subject of targets) {
    const record = await prisma.subject.findUnique({ where: { code: subject.code } })
    if (!record) continue
    await seedSubjectCards(subject, record.id, force)
  }

  console.log("\nDone.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
