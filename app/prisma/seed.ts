import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SUBJECTS = [
  { name: "Mathematics", code: "0580", description: "Cambridge IGCSE Mathematics" },
  { name: "Physics", code: "0625", description: "Cambridge IGCSE Physics" },
  { name: "Chemistry", code: "0620", description: "Cambridge IGCSE Chemistry" },
  { name: "Biology", code: "0610", description: "Cambridge IGCSE Biology" },
  { name: "English Language", code: "0500", description: "Cambridge IGCSE English as a First Language" },
  { name: "Computer Science", code: "0478", description: "Cambridge IGCSE Computer Science" },
  { name: "History", code: "0470", description: "Cambridge IGCSE History" },
  { name: "Geography", code: "0460", description: "Cambridge IGCSE Geography" },
]

async function main() {
  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    })
  }
  console.log(`Seeded ${SUBJECTS.length} IGCSE subjects.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
