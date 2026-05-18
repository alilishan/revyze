import { prisma } from '../lib/prisma'

async function main() {
  const cards = await prisma.flashcard.findMany({
    select: { id: true, question: true, answer: true },
  })
  
  // Questions NOT classified as MCQ by answer but containing option-like text
  const nonMcq = cards.filter(c => !/^[ABCD]$/.test(c.answer.trim()))
  
  // Try to find ones with actual text options pattern
  const OPTION_REGEX = /\bA\b\s+\w.+\s+\bB\b\s+\w.+\s+\bC\b\s+\w.+\s+\bD\b\s+\w/
  const textOptions = nonMcq.filter(c => OPTION_REGEX.test(c.question))
  
  console.log(`Non-MCQ with A/B/C/D option text: ${textOptions.length}`)
  textOptions.slice(0, 10).forEach(c => {
    console.log('Q:', JSON.stringify(c.question))
    console.log('A:', JSON.stringify(c.answer))
    console.log()
  })
  
  await prisma.$disconnect()
}

main()
