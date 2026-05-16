// (preview only — run with --apply to write)
import { prisma } from '../lib/prisma'

const APPLY = process.argv.includes('--apply')
const MCQ_ANSWER_RE = /^([ABCD])\s*[—–-]\s*.+$/
const OPTIONS_RE = /^([\s\S]*)\s+A\s+([\s\S]+?)\s+B\s+([\s\S]+?)\s+C\s+([\s\S]+?)\s+D\s+([\s\S]+?)$/

function formatQuestion(question: string): string | null {
  const m = question.match(OPTIONS_RE)
  if (!m) return null
  const [, rawStem, optA, optB, optC, optD] = m
  const stem = rawStem.trim()
  const opts = [optA, optB, optC, optD].map(o => o.trim())
  if (opts.some(o => o.length === 0 || o.length > 300)) return null
  if (!stem) return null
  const stemHtml = `<p>${stem}</p>`
  const listHtml = `<ul>${opts.map((o, i) => `<li><strong>${'ABCD'[i]}</strong> ${o}</li>`).join('')}</ul>`
  return stemHtml + listHtml
}

async function main() {
  const cards = await prisma.flashcard.findMany({ select: { id: true, question: true, answer: true } })
  const eligible = cards.filter(c => MCQ_ANSWER_RE.test(c.answer.trim()))

  const toUpdate: { id: string; question: string; formatted: string }[] = []
  const skipped: string[] = []

  for (const c of eligible) {
    if (c.question.startsWith('<')) { skipped.push(c.id + ' (already HTML)'); continue }
    const formatted = formatQuestion(c.question)
    if (formatted) toUpdate.push({ id: c.id, question: c.question, formatted })
    else skipped.push(c.id + ' (no parseable block)')
  }

  console.log(`\nTotal: ${cards.length} | Eligible: ${eligible.length} | Will update: ${toUpdate.length} | Skipped: ${skipped.length}`)
  if (skipped.length) console.log('Skipped:', skipped)

  // Show 3 complete examples
  ;[4, 8, 9].forEach(i => {
    const u = toUpdate[i]
    if (!u) return
    console.log(`\n--- EXAMPLE ${i + 1} ---`)
    console.log('BEFORE:', u.question)
    console.log('\nAFTER :', u.formatted)
  })

  if (!APPLY) {
    console.log('\nDry-run only. Add --apply to write to DB.')
    await prisma.$disconnect()
    return
  }

  console.log('\nApplying...')
  let done = 0
  for (const u of toUpdate) {
    await prisma.flashcard.update({ where: { id: u.id }, data: { question: u.formatted } })
    if (++done % 50 === 0) console.log(`  ${done}/${toUpdate.length}`)
  }
  console.log(`Done — updated ${done} flashcards.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
