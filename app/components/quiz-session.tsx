"use client"

import { useState, useRef } from "react"
import { completeQuizAttempt } from "@/actions/quiz"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Flashcard = {
  id: string
  question: string
  answer: string
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
}

type Answer = {
  flashcardId: string
  isCorrect: boolean
  timeSpentSeconds: number
}

const DIFFICULTY_STYLES = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
}

const GRADE = (score: number) => {
  if (score >= 80) return { label: "Excellent!", emoji: "🎉", color: "text-emerald-600" }
  if (score >= 60) return { label: "Good job!", emoji: "👍", color: "text-blue-600" }
  if (score >= 40) return { label: "Keep going!", emoji: "💪", color: "text-amber-500" }
  return { label: "Needs more practice", emoji: "📚", color: "text-red-500" }
}

export function QuizSession({
  attemptId,
  flashcards,
}: {
  attemptId: string
  flashcards: Flashcard[]
}) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [complete, setComplete] = useState(false)
  const [saving, setSaving] = useState(false)

  const sessionStart = useRef(Date.now())
  const cardStart = useRef(Date.now())

  const card = flashcards[index]
  const total = flashcards.length
  const progressPct = Math.round((index / total) * 100)

  const handleAnswer = async (isCorrect: boolean) => {
    const timeSpent = Math.round((Date.now() - cardStart.current) / 1000)
    const updated: Answer[] = [
      ...answers,
      { flashcardId: card.id, isCorrect, timeSpentSeconds: timeSpent },
    ]
    setAnswers(updated)

    if (index === total - 1) {
      setSaving(true)
      const duration = Math.round((Date.now() - sessionStart.current) / 1000)
      await completeQuizAttempt(attemptId, updated, duration)
      setComplete(true)
      setSaving(false)
    } else {
      setIndex((i) => i + 1)
      setRevealed(false)
      cardStart.current = Date.now()
    }
  }

  // ── Score screen ────────────────────────────────────────────────────────
  if (complete) {
    const correct = answers.filter((a) => a.isCorrect).length
    const score = Math.round((correct / total) * 100)
    const grade = GRADE(score)

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center w-full max-w-sm">
          <p className="text-6xl font-black text-slate-900">{score}%</p>
          <p className="text-slate-500 mt-2 text-sm">
            {correct} out of {total} correct
          </p>
          <p className={`text-xl font-semibold mt-4 ${grade.color}`}>
            {grade.emoji} {grade.label}
          </p>

          {/* Per-card breakdown */}
          <div className="mt-6 space-y-1 text-left max-h-48 overflow-y-auto">
            {answers.map((a, i) => (
              <div
                key={a.flashcardId}
                className="flex items-center gap-2 text-xs text-slate-500 py-0.5"
              >
                <span>{a.isCorrect ? "✓" : "✗"}</span>
                <span className="line-clamp-1 flex-1">
                  {flashcards[i].question}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard/quiz/start")}
            >
              Try again
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Active card ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          {index + 1} / {total}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-72 flex flex-col">
        {/* Difficulty badge */}
        <div className="mb-4">
          <span
            className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${DIFFICULTY_STYLES[card.difficulty]}`}
          >
            {card.difficulty}
          </span>
        </div>

        {/* Question */}
        <p className="text-lg font-semibold text-slate-900 leading-relaxed flex-1">
          {card.question}
        </p>

        {/* Reveal / Answer area */}
        {!revealed ? (
          <Button className="mt-6 w-full" onClick={() => setRevealed(true)}>
            Reveal Answer
          </Button>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Answer
              </p>
              <p className="text-slate-800 leading-relaxed">{card.answer}</p>
              {card.explanation && (
                <p className="text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 mt-2">
                  {card.explanation}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleAnswer(false)}
                disabled={saving}
              >
                ✗ Missed it
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleAnswer(true)}
                disabled={saving}
              >
                ✓ Got it!
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Answered so far */}
      {answers.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          {answers.filter((a) => a.isCorrect).length} correct so far
        </p>
      )}
    </div>
  )
}
