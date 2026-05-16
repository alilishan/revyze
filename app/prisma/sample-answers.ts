import { prisma } from '../lib/prisma'

async function main() {
  const cards = await prisma.flashcard.findMany({ select: { id: true, answer: true } })

  const mcqStyle = cards.filter(c => /^[ABCD]\s*[—–-]/.test(c.answer.trim()))
  const multiLine = cards.filter(c => c.answer.includes('\n') && !mcqStyle.includes(c))

  console.log(`Multi-line non-MCQ answers: ${multiLine.length}`)

  // Show a few short ones to understand structure
  const short = multiLine.filter(c => c.answer.length < 400).slice(0, 8)
  short.forEach(c => {
    console.log('\n--- RAW ---')
    console.log(c.answer)
  })
}

main().then(() => prisma.$disconnect())
