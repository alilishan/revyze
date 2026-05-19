import { auth } from "@/auth"
import { getDashboardData, QUIZ_PAGE_SIZE } from "@/lib/dashboard"
import { formatDuration, formatRelativeTime } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatedCards } from "@/components/animated-cards"
import { GreetingCard } from "@/components/greeting-card"
import { AnimatedCounter } from "@/components/animated-counter"
import { UserQuizCard } from "@/components/user-quiz-card"
import { SubjectCard } from "@/components/subject-card"
import { getSubjectColors } from "@/lib/subject-colors"
import { Library, Target, BarChart2, BookOpen } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { PiUserCircle } from "react-icons/pi"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
type Attempt = DashboardData["recentAttempts"][number]

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
  const firstName =
    session.user.name?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "there"
  const totalAttempts = stats._count.id
  const avgScore = stats._avg.score !== null ? Math.round(stats._avg.score) : null

  return (
    <main className="min-h-screen bg-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Greeting card ──────────────────────────────────────────── */}
        <GreetingCard>

          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/25 border border-white/40 flex items-center justify-center shrink-0">
              <PiUserCircle className="text-2xl text-white/40" />
            </div>
            <div>
              <p className="text-white/70 text-xs">Welcome back, {firstName}!</p>
              <h1 className="text-white font-medium text-xl">Ready to revise?</h1>
            </div>
          </div>

          <Link
            href="/dashboard/quiz/start"
            className="relative bg-white text-indigo-600 rounded-xl px-4 py-2 text-sm font-medium shadow-md hover:-translate-y-0.5 transition-transform shrink-0"
          >
            Start Quiz →
          </Link>
        </GreetingCard>

        {/* ── Stats strip ────────────────────────────────────────────── */}
        <AnimatedCards className="grid grid-cols-3 gap-3 sm:gap-4" staggerMs={50}>
          <StatCard icon={Library} label="Subjects" iconClass="bg-indigo-100 text-indigo-600">
            <AnimatedCounter value={subjects.length} className="text-xl sm:text-2xl font-medium text-slate-900" />
          </StatCard>
          <StatCard icon={Target} label="Quizzes taken" iconClass="bg-emerald-100 text-emerald-600">
            <AnimatedCounter value={totalAttempts} className="text-xl sm:text-2xl font-medium text-slate-900" />
          </StatCard>
          <StatCard icon={BarChart2} label="Avg score" iconClass="bg-amber-100 text-amber-600">
            {avgScore !== null ? (
              <AnimatedCounter value={avgScore} suffix="%" className="text-xl sm:text-2xl font-medium text-slate-900" />
            ) : (
              <span className="text-xl sm:text-2xl font-medium text-slate-900">—</span>
            )}
          </StatCard>
        </AnimatedCards>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Your Quizzes — 2/3 width */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-slate-800">Your Quizzes</h2>
              <Link href="/dashboard/quiz/start" className="text-xs text-slate-400 hover:text-slate-600">
                + New quiz
              </Link>
            </div>

            {userQuizzes.length === 0 && page === 1 ? (
              <EmptyState message="No quizzes yet — hit 'Start Quiz' to begin!" />
            ) : (
              <>
                <AnimatedCards className="grid grid-cols-1 sm:grid-cols-2 gap-3" staggerMs={50}>
                  {userQuizzes.map((attempt) => (
                    <UserQuizCard key={attempt.id} attempt={attempt} />
                  ))}
                </AnimatedCards>

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

          {/* Recent Activity — 1/3 width */}
          <section className="space-y-4">
            <h2 className="text-base font-medium text-slate-800">Recent Activity</h2>
            {recentAttempts.length === 0 ? (
              <EmptyState message="No attempts yet. Take your first quiz!" />
            ) : (
              <AnimatedCards className="space-y-2" staggerMs={40}>
                {recentAttempts.map((attempt) => (
                  <AttemptCard key={attempt.id} attempt={attempt} />
                ))}
              </AnimatedCards>
            )}
          </section>
        </div>

        {/* ── Browse Subjects ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-base font-medium text-slate-800">Browse Subjects</h2>
          <AnimatedCards className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" staggerMs={40}>
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </AnimatedCards>
        </section>

      </div>
    </main>
  )
}

// ── Server-rendered sub-components ───────────────────────────────────────────

function AttemptCard({ attempt }: { attempt: Attempt }) {
  const colors = getSubjectColors(attempt.quiz.subject.code)
  const score = attempt.score

  const scoreBadgeClass =
    score >= 80 ? "bg-emerald-100 text-emerald-800"
    : score >= 60 ? "bg-blue-100 text-blue-800"
    : score >= 40 ? "bg-amber-100 text-amber-800"
    : "bg-red-100 text-red-800"

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900 line-clamp-1 flex-1">
          {attempt.quiz.title}
        </p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${scoreBadgeClass}`}>
          {score}%
        </span>
      </div>
      <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: colors.hex }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          {attempt.quiz.subject.name}
        </span>
        {attempt.completedAt && (
          <span className="text-xs text-slate-400">
            {formatRelativeTime(new Date(attempt.completedAt))}
          </span>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <BookOpen className="w-5 h-5 text-indigo-400" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
      <Link
        href="/dashboard/quiz/start"
        className="inline-block mt-3 text-xs text-indigo-600 hover:underline"
      >
        Start a quiz →
      </Link>
    </div>
  )
}
