import { prisma } from "@/lib/prisma"
import { createDynamicQuiz } from "@/actions/quiz"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  PiShuffleAngular,
  PiLeaf,
  PiBrain,
  PiLightning,
  PiCalendarBlank,
  PiTrophy,
} from "react-icons/pi"
import Link from "next/link"
import type { IconType } from "react-icons"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Start Quiz — Revyze",
}

const DIFFICULTIES: { value: string; icon: IconType; label: string; description: string }[] = [
  { value: "MIXED",  icon: PiShuffleAngular, label: "Mixed",  description: "All levels"       },
  { value: "EASY",   icon: PiLeaf,           label: "Easy",   description: "Build confidence" },
  { value: "MEDIUM", icon: PiBrain,          label: "Medium", description: "Core knowledge"   },
  { value: "HARD",   icon: PiLightning,      label: "Hard",   description: "Exam ready"       },
]

const CARD_COUNTS = [5, 10, 15, 20] as const

const QUESTION_FILTERS: { value: string; icon: IconType; label: string; description: string }[] = [
  { value: "ALL",           icon: PiShuffleAngular, label: "All years",     description: "Random mix from the full question bank"    },
  { value: "LAST_5_YEARS",  icon: PiCalendarBlank,  label: "Last 5 years",  description: "Questions from recent past papers only"    },
  { value: "TOP_FREQUENCY", icon: PiTrophy,         label: "Most frequent", description: "Highest-appearing exam topics first"       },
]

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
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-600"
        >
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
        <form action={createDynamicQuiz} className="space-y-8">
          {/* ── Subject ─────────────────────────────────────────────── */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">
              Subject
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {available.map((subject, i) => (
                <label key={subject.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="subjectId"
                    value={subject.id}
                    defaultChecked={
                      preselectedSubjectId
                        ? subject.id === preselectedSubjectId
                        : i === 0
                    }
                    className="sr-only peer"
                  />
                  <div
                    className={cn(
                      "border rounded-xl p-3 text-sm transition-colors",
                      "border-slate-200 bg-white",
                      "peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white"
                    )}
                  >
                    <p className="font-medium leading-tight">{subject.name}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {subject._count.flashcards} cards
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* ── Difficulty ──────────────────────────────────────────── */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">
              Difficulty
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => {
                const Icon = d.icon
                return (
                  <label key={d.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={d.value}
                      defaultChecked={d.value === "MIXED"}
                      className="sr-only peer"
                    />
                    <div
                      className={cn(
                        "border rounded-xl p-3 text-center transition-colors",
                        "border-slate-200 bg-white",
                        "peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white"
                      )}
                    >
                      <Icon className="text-xl mx-auto mb-1 opacity-80" />
                      <p className="text-xs font-medium">{d.label}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* ── Question filter ─────────────────────────────────────── */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">
              Question Selection
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {QUESTION_FILTERS.map((f) => {
                const Icon = f.icon
                return (
                  <label key={f.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="questionFilter"
                      value={f.value}
                      defaultChecked={f.value === "ALL"}
                      className="sr-only peer"
                    />
                    <div
                      className={cn(
                        "border rounded-xl p-3 transition-colors",
                        "border-slate-200 bg-white",
                        "peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white"
                      )}
                    >
                      <Icon className="text-2xl mb-1.5 opacity-80" />
                      <p className="text-xs font-medium leading-tight">{f.label}</p>
                      <p className="text-xs opacity-60 mt-0.5 leading-tight">{f.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* ── Card count ──────────────────────────────────────────── */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">
              Number of Questions
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {CARD_COUNTS.map((n, i) => (
                <label key={n} className="cursor-pointer">
                  <input
                    type="radio"
                    name="cardCount"
                    value={String(n)}
                    defaultChecked={i === 1}
                    className="sr-only peer"
                  />
                  <div
                    className={cn(
                      "border rounded-xl p-3 text-center transition-colors",
                      "border-slate-200 bg-white",
                      "peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white"
                    )}
                  >
                    <p className="text-lg font-bold">{n}</p>
                    <p className="text-xs opacity-60">
                      {n <= 5 ? "Quick" : n <= 10 ? "Standard" : n <= 15 ? "Long" : "Full"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* ── Scoring note ────────────────────────────────────────── */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 px-4 py-3 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">How scoring works</p>
            <p>Each card you mark as &quot;Got it&quot; scores 1 point.</p>
            <p>
              <span className="text-emerald-600 font-medium">80%+</span> Excellent
              &nbsp;·&nbsp;
              <span className="text-blue-600 font-medium">60%</span> Good
              &nbsp;·&nbsp;
              <span className="text-amber-500 font-medium">40%</span> Keep going
              &nbsp;·&nbsp;
              <span className="text-red-500 font-medium">Below 40%</span> Needs work
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Start Quiz
          </Button>
        </form>
      )}
    </main>
  )
}
