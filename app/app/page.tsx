import { auth } from "@/auth"
import { checkDbConnection } from "@/actions/db-health"
import { handleSignOut } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import Link from "next/link"

export default async function HomePage() {
  const [session, dbStatus] = await Promise.all([
    auth(),
    checkDbConnection(),
  ])

  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen bg-indigo-50">

      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-medium text-lg tracking-tight">
            <span className="text-slate-900">REVY</span>
            <span className="text-indigo-600">ZE</span>
          </span>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-500 hover:text-slate-700 hidden sm:block"
                >
                  Dashboard
                </Link>
                <form action={handleSignOut}>
                  <Button variant="outline" size="sm" type="submit">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 border border-slate-300 bg-white rounded-xl px-4 py-1.5 hover:-translate-y-0.5 transition-transform"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm text-white bg-indigo-600 rounded-xl px-4 py-1.5 shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-transform"
                >
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <HeroSection isLoggedIn={isLoggedIn} />

      <FeatureCards />

      <footer className="bg-indigo-950 text-indigo-200 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <span className="font-medium text-lg tracking-tight">
              <span className="text-white">REVY</span>
              <span className="text-indigo-400">ZE</span>
            </span>
            <p className="text-xs text-indigo-300 leading-relaxed max-w-xs">
              Smart revision for Cambridge IGCSE students. Built from real past papers, designed to help you study smarter.
            </p>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest">About</h3>
            <p className="text-xs text-indigo-300 leading-relaxed">
              Revyze is a free study tool developed to help IGCSE students revise effectively using exam-style flashcards and timed quizzes drawn from Cambridge past papers.
            </p>
          </div>

          {/* SEALabs */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest">SEALabs</h3>
            <p className="text-xs text-indigo-300 leading-relaxed">
              Revyze is a product of SEALabs — building tools for learners and educators.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-indigo-900">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-indigo-500">
              © {new Date().getFullYear()} SEALabs. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  dbStatus.connected ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              <span className="text-xs text-indigo-500">
                {dbStatus.connected ? "All systems operational" : "Database unavailable"}
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
