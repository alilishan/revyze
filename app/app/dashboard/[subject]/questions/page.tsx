import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { QuestionBank } from '@/components/question-bank'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

type Props = { params: Promise<{ subject: string }> }

async function findSubject(slug: string) {
  // slug is e.g. "biology", "computer-science" — match against lowercased name
  return prisma.subject.findFirst({
    where: { name: { equals: slug.replace(/-/g, ' ') } },
    select: { id: true, name: true },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params
  const subject = await findSubject(slug)
  return { title: subject ? `${subject.name} Questions — Revyze` : 'Questions — Revyze' }
}

export default async function QuestionsPage({ params }: Props) {
  const [session, { subject: slug }] = await Promise.all([auth(), params])
  if (!session?.user?.id) redirect('/login')

  const subject = await findSubject(slug)
  if (!subject) redirect('/dashboard')

  const flashcards = await prisma.flashcard.findMany({
    where: { subjectId: subject.id },
    select: {
      id: true,
      question: true,
      answer: true,
      explanation: true,
      difficulty: true,
      frequency: true,
      imageUrl: true,
      topicId: true,
      topic: { select: { name: true } },
      sources: { select: { paper: true, year: true, session: true, questionNumber: true } },
    },
    orderBy: { frequency: 'desc' },
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
            {subject.name}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
        </div>
        <Link
          href="/dashboard/quiz/start"
          className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}
        >
          Start Quiz →
        </Link>
      </div>

      <QuestionBank flashcards={flashcards} />
    </main>
  )
}
