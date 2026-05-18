import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QuizSession } from "@/components/quiz-session"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quiz",
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const [session, { attemptId }] = await Promise.all([auth(), params])
  if (!session?.user?.id) redirect("/login")

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId, userId: session.user.id },
    include: {
      quiz: {
        include: {
          subject: { select: { name: true } },
          quizFlashcards: {
            orderBy: { order: "asc" },
            include: {
              flashcard: {
                select: {
                  id: true,
                  question: true,
                  answer: true,
                  explanation: true,
                  difficulty: true,
                  frequency: true,
                  imageUrl: true,
                  sources: {
                    select: {
                      paper: true,
                      year: true,
                      session: true,
                      questionNumber: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!attempt) redirect("/dashboard")
  if (attempt.completedAt) redirect(`/dashboard/quiz/${attempt.id}/review`)

  const flashcards = attempt.quiz.quizFlashcards.map((qf) => qf.flashcard)

  // Flashcards were deleted under this attempt (e.g. re-seed with --force)
  if (flashcards.length === 0) redirect("/dashboard/quiz/start")

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {attempt.quiz.subject.name}
          </p>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            {attempt.quiz.title}
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-600 mt-1"
        >
          Quit
        </Link>
      </div>

      <QuizSession attemptId={attempt.id} flashcards={flashcards} startedAt={attempt.startedAt} />
    </main>
  )
}
