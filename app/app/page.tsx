import { auth } from "@/auth"
import { checkDbConnection } from "@/actions/db-health"
import { handleSignOut } from "@/actions/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function HomePage() {
  const [session, dbStatus] = await Promise.all([
    auth(),
    checkDbConnection(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-slate-900 tracking-tight">
            IGCSE FlashCards
          </span>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm text-slate-500 hidden sm:block">
                  {session.user.email}
                </span>
                <form action={handleSignOut}>
                  <Button variant="outline" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          IGCSE FlashCards
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-xl mx-auto">
          Master every Cambridge IGCSE subject with targeted flashcards, timed
          quizzes, and detailed progress tracking.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg">Start revising</Button>
          <Button size="lg" variant="outline">
            Browse subjects
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureCard
          title="Multiple subjects"
          description="Covers the full Cambridge IGCSE curriculum — Maths, Sciences, Humanities, Languages and more."
        />
        <FeatureCard
          title="Progress tracking"
          description="Every student's history stored individually. See score trends and time-spent per quiz over time."
        />
        <FeatureCard
          title="Timed quizzes"
          description="Attempt quizzes under exam conditions. Score, duration, and every answer are recorded automatically."
        />
      </section>

      {/* DB status */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div
          className={`rounded-xl border px-5 py-4 ${
            dbStatus.connected
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                dbStatus.connected ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-semibold text-slate-800">
              {dbStatus.connected
                ? "Database connected"
                : "Database not connected"}
            </span>
          </div>
          <p className="text-sm text-slate-600">{dbStatus.message}</p>
          <p className="text-xs text-slate-400 mt-1">
            Checked {new Date(dbStatus.checkedAt).toLocaleTimeString()}
          </p>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
