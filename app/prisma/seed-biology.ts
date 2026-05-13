/**
 * Seeds IGCSE Biology flashcards from material/biology/flashcards.json.
 *
 * Run from app/:
 *   npx tsx prisma/seed-biology.ts
 *
 * If Biology flashcards already exist, the script exits safely.
 * To wipe and re-seed:
 *   npx tsx prisma/seed-biology.ts --force
 */
import { PrismaClient, type Difficulty } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

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
}

async function main() {
  const force = process.argv.includes("--force")

  // Resolve JSON path relative to cwd (app/)
  const jsonPath = join(process.cwd(), "../material/biology/flashcards.json")
  const cards: Card[] = JSON.parse(readFileSync(jsonPath, "utf-8"))

  // Find Biology subject
  const biology = await prisma.subject.findFirst({ where: { code: "0610" } })
  if (!biology) {
    throw new Error(
      'Biology subject not found. Run "npx prisma db seed" first to populate subjects.'
    )
  }

  // Guard against re-seeding
  const existing = await prisma.flashcard.count({ where: { subjectId: biology.id } })
  if (existing > 0) {
    if (!force) {
      console.log(
        `Biology already has ${existing} flashcards — skipping. Use --force to wipe and re-seed.`
      )
      return
    }
    // --force: clear existing data for this subject
    await prisma.flashcard.deleteMany({ where: { subjectId: biology.id } })
    await prisma.topic.deleteMany({ where: { subjectId: biology.id } })
    console.log(`Cleared ${existing} existing Biology flashcards and their topics.`)
  }

  // Create one Topic record per unique topic name
  const topicNames = [...new Set(cards.map((c) => c.topic))].sort()
  const topicMap: Record<string, string> = {}

  for (const name of topicNames) {
    const topic = await prisma.topic.create({
      data: { name, subjectId: biology.id },
    })
    topicMap[name] = topic.id
  }
  console.log(`Created ${topicNames.length} topics.`)

  // Insert flashcards + sources
  let sourceCount = 0

  for (const card of cards) {
    await prisma.flashcard.create({
      data: {
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        difficulty: card.difficulty,
        frequency: card.frequency,
        subjectId: biology.id,
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

  // Summary
  const byDiff = cards.reduce(
    (acc, c) => ({ ...acc, [c.difficulty]: (acc[c.difficulty] ?? 0) + 1 }),
    {} as Record<string, number>
  )

  console.log(`✓ Seeded ${cards.length} Biology flashcards with ${sourceCount} source references.`)
  console.log(
    `  Easy: ${byDiff.EASY ?? 0}  |  Medium: ${byDiff.MEDIUM ?? 0}  |  Hard: ${byDiff.HARD ?? 0}`
  )
  console.log(`  Topics: ${topicNames.length}`)

  // Top 5 highest-frequency concepts
  const top5 = [...cards].sort((a, b) => b.frequency - a.frequency).slice(0, 5)
  console.log("\nTop 5 exam-priority concepts:")
  for (const c of top5) {
    console.log(`  [${c.frequency}x] ${c.question.slice(0, 72)}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
