import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatDuration } from "@/lib/format"
import { HtmlContent } from "@/components/html-content"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Quiz Review — Revyze" }

const DIFF_STYLES = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
}

type Props = {
  params: Promise<{ attemptId: string }>
  searchParams: Promise<{ filter?: string }>
}

export default async function ReviewPage({ params, searchParams }: Props) {
  const [session, { attemptId }, { filter }] = await Promise.all([auth(), params, searchParams])
  if (!session?.user?.id) redirect("/login")

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId, userId: session.user.id, completedAt: { not: null } },
    select: {
      id: true,
      score: true,
      correctAnswers: true,
      totalQuestions: true,
      durationSeconds: true,
      completedAt: true,
      quiz: {
        select: {
          title: true,
          subject: { select: { name: true } },
          quizFlashcards: {
            orderBy: { order: "asc" },
            select: {
              flashcard: {
                select: {
                  id: true,
                  question: true,
                  answer: true,
                  explanation: true,
                  imageUrl: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      },
      answers: {
        select: { flashcardId: true, isCorrect: true, timeSpentSeconds: true },
      },
    },
  })

  if (!attempt) redirect("/dashboard")

  // Merge answers into the ordered flashcard list
  const answerMap = new Map(attempt.answers.map((a) => [a.flashcardId, a]))
  const allItems = attempt.quiz.quizFlashcards.map((qf, i) => ({
    index: i + 1,
    flashcard: qf.flashcard,
    answer: answerMap.get(qf.flashcard.id) ?? null,
  }))
  const showMissed = filter === "missed"
  const items = showMissed ? allItems.filter((it) => it.answer && !it.answer.isCorrect) : allItems

  const scoreColor =
    attempt.score >= 80
      ? "text-emerald-600"
      : attempt.score >= 60
        ? "text-blue-600"
        : attempt.score >= 40
          ? "text-amber-500"
          : "text-red-500"

  const date = attempt.completedAt
    ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">
            {attempt.quiz.subject.name}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            {attempt.quiz.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{date}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-600 shrink-0 mt-1"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Score summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-8">
        <div className="text-center shrink-0">
          <p className={`text-5xl font-black ${scoreColor}`}>{attempt.score}%</p>
          <p className="text-xs text-slate-400 mt-1">Score</p>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {attempt.correctAnswers}
            </p>
            <p className="text-xs text-slate-400">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">
              {attempt.totalQuestions - attempt.correctAnswers}
            </p>
            <p className="text-xs text-slate-400">Missed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatDuration(attempt.durationSeconds)}
            </p>
            <p className="text-xs text-slate-400">Duration</p>
          </div>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/quiz/${attempt.id}/review`}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            !showMissed
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          }`}
        >
          All ({allItems.length})
        </Link>
        <Link
          href={`/dashboard/quiz/${attempt.id}/review?filter=missed`}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            showMissed
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          }`}
        >
          Missed ({allItems.filter((it) => it.answer && !it.answer.isCorrect).length})
        </Link>
      </div>

      {/* Per-question breakdown */}
      <div className="flex flex-col gap-4">
        {items.map(({ index, flashcard, answer }) => (
          <div
            key={flashcard.id}
            className={`bg-white rounded-2xl border p-5 ${
              answer === null
                ? "border-slate-200"
                : answer.isCorrect
                  ? "border-emerald-200"
                  : "border-red-100"
            }`}
          >
            {/* Row: question number, difficulty, result, time */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  Q{index}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[flashcard.difficulty]}`}
                >
                  {flashcard.difficulty[0] +
                    flashcard.difficulty.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {answer?.timeSpentSeconds != null && (
                  <span className="text-xs text-slate-400 tabular-nums">
                    {answer.timeSpentSeconds}s
                  </span>
                )}
                {answer !== null && (
                  <span
                    className={`text-sm font-bold ${
                      answer.isCorrect ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {answer.isCorrect ? "✓ Got it" : "✗ Missed"}
                  </span>
                )}
              </div>
            </div>

            {/* Question */}
            <HtmlContent
              html={flashcard.question}
              className="text-sm font-semibold text-slate-900 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-0.5 [&_li]:font-normal [&_li]:text-slate-700 [&_p]:mb-0"
            />

            {flashcard.imageUrl && (
              <div className="rounded-xl border border-slate-100 overflow-hidden mt-3">
                <img
                  src={`/flashcard-images/${flashcard.imageUrl}`}
                  alt="Exam diagram"
                  className="w-full"
                />
              </div>
            )}

            {/* Answer */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Answer
              </p>
              <HtmlContent
                html={flashcard.answer}
                className="text-sm text-slate-700 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-0.5 [&_p]:mb-0"
              />
              {flashcard.explanation && (
                <HtmlContent
                  html={flashcard.explanation}
                  className="mt-2 text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5 [&_p]:mb-0"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/quiz/start"
          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
        >
          New quiz
        </Link>
        <Link href="/dashboard" className={cn(buttonVariants(), "flex-1")}>
          Dashboard
        </Link>
      </div>
    </main>
  )
}
