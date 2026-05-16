/**
 * Converts multi-line plain-text answers to HTML by replacing \n with <br>.
 * MCQ answers ("C — pectinase") and already-HTML answers are left unchanged.
 *
 * Dry run:  npx tsx prisma/format-answers.ts
 * Apply:    npx tsx prisma/format-answers.ts --apply
 */

import { prisma } from '../lib/prisma'

const APPLY = process.argv.includes('--apply')

function formatAnswer(answer: string): string | null {
  // Skip if already HTML
  if (answer.trim().startsWith('<')) return null
  // Skip if no newlines — nothing to do
  if (!answer.includes('\n')) return null

  // Two or more consecutive newlines → paragraph break, single → line break
  const html = answer
    .trim()
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>')

  return html
}

async function main() {
  const cards = await prisma.flashcard.findMany({ select: { id: true, answer: true } })

  const toUpdate: { id: string; before: string; after: string }[] = []

  for (const c of cards) {
    const formatted = formatAnswer(c.answer)
    if (formatted) toUpdate.push({ id: c.id, before: c.answer, after: formatted })
  }

  console.log(`\nTotal: ${cards.length} | Will update: ${toUpdate.length}\n`)

  // Preview 5
  toUpdate.slice(0, 5).forEach((u, i) => {
    console.log(`--- EXAMPLE ${i + 1} ---`)
    console.log('BEFORE:\n', u.before.slice(0, 300))
    console.log('\nAFTER:\n', u.after.slice(0, 300))
    console.log()
  })

  if (!APPLY) {
    console.log('Dry-run only. Add --apply to write to DB.')
    await prisma.$disconnect()
    return
  }

  console.log('Applying...')
  let done = 0
  for (const u of toUpdate) {
    await prisma.flashcard.update({ where: { id: u.id }, data: { answer: u.after } })
    if (++done % 50 === 0) console.log(`  ${done}/${toUpdate.length}`)
  }
  console.log(`Done — updated ${done} answers.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
