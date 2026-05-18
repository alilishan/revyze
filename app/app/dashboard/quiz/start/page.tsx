import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"
import { QuizStartForm } from "./quiz-form"

export const metadata: Metadata = {
  title: "Start Quiz",
}

export default async function StartQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const { subjectId: preselectedSubjectId } = await searchParams
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { flashcards: true } } },
  })

  const available = subjects.filter((s) => s._count.flashcards > 0)
  const empty = available.length === 0

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600">
          ← Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Start a Quiz</h1>
      <p className="text-slate-500 text-sm mb-8">
        Pick your subject, difficulty, and how many questions you want.
      </p>

      {empty ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">
            No flashcards available yet. Seed a subject to get started.
          </p>
          <code className="mt-3 block text-xs bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-mono">
            npx tsx prisma/seed-biology.ts
          </code>
        </div>
      ) : (
        <QuizStartForm
          subjects={available}
          preselectedSubjectId={preselectedSubjectId}
        />
      )}
    </main>
  )
}
