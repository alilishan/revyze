import { auth } from "@/auth"
import { getDashboardData, QUIZ_PAGE_SIZE } from "@/lib/dashboard"
import { formatDuration } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { nameToSlug } from "@/lib/subject-slug"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — IGCSE FlashCards",
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
type UserQuiz = DashboardData["userQuizzes"][number]
type Attempt = DashboardData["recentAttempts"][number]
type Subject = DashboardData["subjects"][number]

const SUBJECT_EMOJI: Record<string, string> = {
  "0580": "📐",
  "0625": "⚡",
  "0620": "🧪",
  "0610": "🧬",
  "0500": "📖",
  "0478": "💻",
  "0470": "🏛️",
  "0460": "🌍",
}

const scoreColor = (pct: number) =>
  pct >= 80
    ? "text-emerald-600"
    : pct >= 60
      ? "text-blue-600"
      : pct >= 40
        ? "text-amber-500"
        : "text-red-500"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const { userQuizzes, totalQuizzes, recentAttempts, subjects, stats } =
    await getDashboardData(session.user.id, page)

  const totalPages = Math.max(1, Math.ceil(totalQuizzes / QUIZ_PAGE_SIZE))

  const firstName = session.user.name?.split(" ")[0] ?? "there"
  const totalAttempts = stats._count.id
  const avgScore =
    stats._avg.score !== null ? Math.round(stats._avg.score) : null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Hey {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {totalAttempts === 0
              ? "Ready to start revising? Pick a quiz below to kick things off."
              : "Great to see you back. Keep the momentum going!"}
          </p>
        </div>
        <Link
          href="/dashboard/quiz/start"
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          Start Quiz →
        </Link>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-4">
        <StatCard value={String(subjects.length)} label="Subjects" />
        <StatCard value={String(totalAttempts)} label="Quizzes taken" />
        <StatCard
          value={avgScore !== null ? `${avgScore}%` : "—"}
          label="Avg score"
        />
      </section>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Quizzes — takes 2/3 width on large screens */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Your Quizzes" />
            <Link
              href="/dashboard/quiz/start"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              + New quiz
            </Link>
          </div>
          {userQuizzes.length === 0 && page === 1 ? (
            <EmptyState message="No quizzes yet — hit 'Start Quiz' to begin!" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userQuizzes.map((attempt) => (
                  <UserQuizCard key={attempt.id} attempt={attempt} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/dashboard?page=${page - 1}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      page <= 1 && "pointer-events-none opacity-40",
                    )}
                    aria-disabled={page <= 1}
                  >
                    ← Prev
                  </Link>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <Link
                    href={`/dashboard?page=${page + 1}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      page >= totalPages && "pointer-events-none opacity-40",
                    )}
                    aria-disabled={page >= totalPages}
                  >
                    Next →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* Recent Activity — takes 1/3 width on large screens */}
        <section className="space-y-4">
          <SectionHeader title="Recent Activity" />
          {recentAttempts.length === 0 ? (
            <EmptyState message="No attempts yet. Take your first quiz!" />
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((attempt) => (
                <AttemptCard key={attempt.id} attempt={attempt} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Browse subjects ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader title="Browse Subjects" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-slate-800">{title}</h2>
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function UserQuizCard({ attempt }: { attempt: UserQuiz }) {
  const color = scoreColor(attempt.score)
  const date = attempt.completedAt
    ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : ""

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:border-slate-300 transition-colors">
      <Link href={`/dashboard/quiz/${attempt.id}/review`} className="block">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {attempt.quiz.subject.name}
        </p>
        <p className="font-semibold text-slate-900 mt-0.5 line-clamp-1 text-sm">
          {attempt.quiz.title}
        </p>
        <p className={`text-2xl font-black mt-2 ${color}`}>{attempt.score}%</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {attempt.correctAnswers}/{attempt.totalQuestions} correct &middot;{" "}
          {formatDuration(attempt.durationSeconds)} &middot; {date}
        </p>
      </Link>
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/dashboard/quiz/start?subjectId=${attempt.quiz.subject.id}`}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "flex-1")}
        >
          Retake
        </Link>
      </div>
    </div>
  )
}

function AttemptCard({ attempt }: { attempt: Attempt }) {
  const color = scoreColor(attempt.score)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-400">{attempt.quiz.subject.name}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5 line-clamp-1">
        {attempt.quiz.title}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-lg font-bold ${color}`}>{attempt.score}%</span>
        <div className="text-right">
          <p className="text-xs text-slate-400">
            {attempt.completedAt
              ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })
              : "In progress"}
          </p>
          {attempt.completedAt && (
            <p className="text-xs text-slate-400">{formatDuration(attempt.durationSeconds)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SubjectCard({ subject }: { subject: Subject }) {
  const emoji = SUBJECT_EMOJI[subject.code] ?? "📚"
  const hasCards = subject._count.flashcards > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors flex flex-col gap-3">
      <div>
        <span className="text-2xl">{emoji}</span>
        <p className="font-semibold text-slate-900 text-sm mt-2">
          {subject.name}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {hasCards ? `${subject._count.flashcards} cards` : "No cards yet"}
        </p>
      </div>
      {hasCards && (
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/dashboard/${nameToSlug(subject.name)}/questions`}
            className="flex-1 text-center text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 transition-colors"
          >
            Questions
          </Link>
          <Link
            href="/dashboard/quiz/start"
            className="flex-1 text-center text-xs font-medium text-white bg-slate-900 hover:bg-slate-700 rounded-lg py-1.5 transition-colors"
          >
            Quiz →
          </Link>
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}
