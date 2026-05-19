'use client'

import { createDynamicQuiz } from "@/actions/quiz"
import { ToggleGroup } from "@/components/animate-ui/toggle-group"
import { SubmitButton } from "@/components/submit-button"
import {
  PiShuffleAngular,
  PiLeaf,
  PiBrain,
  PiLightning,
  PiCalendarBlank,
  PiTrophy,
} from "react-icons/pi"
import type { IconType } from "react-icons"

type Subject = {
  id: string
  name: string
  _count: { flashcards: number }
}

const DIFFICULTIES: { value: string; icon: IconType; label: string }[] = [
  { value: "MIXED",  icon: PiShuffleAngular, label: "Mixed"  },
  { value: "EASY",   icon: PiLeaf,           label: "Easy"   },
  { value: "MEDIUM", icon: PiBrain,          label: "Medium" },
  { value: "HARD",   icon: PiLightning,      label: "Hard"   },
]

const CARD_COUNTS = [
  { value: "5",  label: "Quick"    },
  { value: "10", label: "Standard" },
  { value: "15", label: "Long"     },
  { value: "20", label: "Full"     },
]

const QUESTION_FILTERS: { value: string; icon: IconType; label: string }[] = [
  { value: "ALL",           icon: PiShuffleAngular, label: "All years"     },
  { value: "LAST_5_YEARS",  icon: PiCalendarBlank,  label: "Last 5 years"  },
  { value: "TOP_FREQUENCY", icon: PiTrophy,         label: "Most frequent" },
]

export function QuizStartForm({
  subjects,
  preselectedSubjectId,
}: {
  subjects: Subject[]
  preselectedSubjectId?: string
}) {
  const defaultSubjectId = preselectedSubjectId ?? subjects[0]?.id ?? ""

  return (
    <form action={createDynamicQuiz} className="space-y-8">

      {/* ── Subject ─────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">Subject</legend>
        <ToggleGroup
          name="subjectId"
          defaultValue={defaultSubjectId}
          className="grid grid-cols-2 gap-1"
          options={subjects.map((s) => ({
            value: s.id,
            label: (
              <>
                <span className="text-xs font-medium leading-tight">{s.name}</span>
                <span className="text-xs opacity-50">{s._count.flashcards} cards</span>
              </>
            ),
          }))}
        />
      </fieldset>

      {/* ── Difficulty ──────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">Difficulty</legend>
        <ToggleGroup
          name="difficulty"
          defaultValue="MIXED"
          options={DIFFICULTIES.map((d) => {
            const Icon = d.icon
            return {
              value: d.value,
              label: (
                <>
                  <Icon className="text-xl opacity-80" />
                  <span className="text-xs font-medium">{d.label}</span>
                </>
              ),
            }
          })}
        />
      </fieldset>

      {/* ── Question filter ─────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">Question Selection</legend>
        <ToggleGroup
          name="questionFilter"
          defaultValue="ALL"
          options={QUESTION_FILTERS.map((f) => {
            const Icon = f.icon
            return {
              value: f.value,
              label: (
                <>
                  <Icon className="text-2xl opacity-80" />
                  <span className="text-xs font-medium leading-tight">{f.label}</span>
                </>
              ),
            }
          })}
        />
      </fieldset>

      {/* ── Card count ──────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">Number of Questions</legend>
        <ToggleGroup
          name="cardCount"
          defaultValue="10"
          options={CARD_COUNTS.map((c) => ({
            value: c.value,
            label: (
              <>
                <span className="text-lg font-bold">{c.value}</span>
                <span className="text-xs opacity-60">{c.label}</span>
              </>
            ),
          }))}
        />
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

      <SubmitButton size="lg" className="w-full" loadingText="Starting…">
        Start Quiz
      </SubmitButton>
    </form>
  )
}
