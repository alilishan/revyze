import { prisma } from '../lib/prisma'

async function main() {
  const cards = await prisma.flashcard.findMany({ take: 30, select: { id: true, question: true } })
  cards.forEach(c => console.log('---', c.id, '\n', c.question, '\n'))
  await prisma.$disconnect()
}

main()
