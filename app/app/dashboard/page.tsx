import { auth } from "@/auth"
import { getDashboardData } from "@/lib/dashboard"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — IGCSE FlashCards",
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
type Quiz = DashboardData["availableQuizzes"][number]
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

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { recentAttempts, availableQuizzes, subjects, stats } =
    await getDashboardData(session.user.id)

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
        {/* Available quizzes — takes 2/3 width on large screens */}
        <section className="lg:col-span-2 space-y-4">
          <SectionHeader title="Available Quizzes" />
          {availableQuizzes.length === 0 ? (
            <EmptyState message="No quizzes yet — check back soon!" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </section>

        {/* Recent activity — takes 1/3 width on large screens */}
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

function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {quiz.subject.name}
        </p>
        <p className="font-semibold text-slate-900 mt-0.5 line-clamp-2 text-sm">
          {quiz.title}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-400">
          {quiz._count.quizFlashcards}{" "}
          {quiz._count.quizFlashcards === 1 ? "question" : "questions"}
        </span>
        <Link
          href="/dashboard/quiz/start"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Start
        </Link>
      </div>
    </div>
  )
}

function AttemptCard({ attempt }: { attempt: Attempt }) {
  const pct =
    attempt.totalQuestions > 0
      ? Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)
      : attempt.score

  const scoreColor =
    pct >= 70
      ? "text-emerald-600"
      : pct >= 50
        ? "text-amber-500"
        : "text-red-500"

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-400">{attempt.quiz.subject.name}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5 line-clamp-1">
        {attempt.quiz.title}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-lg font-bold ${scoreColor}`}>{pct}%</span>
        <span className="text-xs text-slate-400">
          {attempt.completedAt
            ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : "In progress"}
        </span>
      </div>
    </div>
  )
}

function SubjectCard({ subject }: { subject: Subject }) {
  const emoji = SUBJECT_EMOJI[subject.code] ?? "📚"
  const hasCards = subject._count.flashcards > 0

  return (
    <Link
      href={hasCards ? "/dashboard/quiz/start" : "#"}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors block"
    >
      <span className="text-2xl">{emoji}</span>
      <p className="font-semibold text-slate-900 text-sm mt-2">
        {subject.name}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {subject._count.flashcards > 0
          ? `${subject._count.flashcards} cards`
          : "No cards yet"}
      </p>
    </Link>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}
