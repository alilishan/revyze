"use client"

import { useState, useRef } from "react"
import { completeQuizAttempt } from "@/actions/quiz"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTimer } from "@/hooks/use-timer"
import { formatDuration } from "@/lib/format"
import { HtmlContent } from "@/components/html-content"
import { stripHtml } from "@/lib/html"

type FlashcardSource = {
  paper: string
  year: string
  session: string
  questionNumber: string
}

type Flashcard = {
  id: string
  question: string
  answer: string
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  frequency: number
  imageUrl: string | null
  sources: FlashcardSource[]
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
  startedAt,
}: {
  attemptId: string
  flashcards: Flashcard[]
  startedAt: Date
}) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [complete, setComplete] = useState(false)
  const [saving, setSaving] = useState(false)

  const sessionStart = useRef(Date.now())
  const cardStart = useRef(Date.now())
  const { formatted } = useTimer(startedAt)
  const [totalDuration, setTotalDuration] = useState(0)

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
      setTotalDuration(duration)
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
            {correct} out of {total} correct &middot; {formatDuration(totalDuration)}
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
                  {stripHtml(flashcards[i].question)}
                </span>
                <span className="tabular-nums shrink-0">{a.timeSpentSeconds}s</span>
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
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => router.push(`/dashboard/quiz/${attemptId}/review`)}
          >
            View full review →
          </Button>
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
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          ⏱ {formatted}
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
        <HtmlContent
          html={card.question}
          className="text-lg font-semibold text-slate-900 leading-relaxed flex-1 [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1 [&_li]:font-normal"
        />

        {/* Diagram — shown before and after reveal */}
        {card.imageUrl && (
          <div className="rounded-xl border border-slate-100 overflow-hidden mt-4">
            <img
              src={`/flashcard-images/${card.imageUrl}`}
              alt="Exam diagram"
              className="w-full"
            />
          </div>
        )}

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
              <HtmlContent html={card.answer} className="text-slate-800 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1" />
              {card.explanation && (
                <HtmlContent html={card.explanation} className="text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5" />
              )}

              {card.frequency > 0 && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Exam frequency
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      ⭐ {card.frequency}× in past papers
                    </span>
                  </div>

                  {card.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {card.sources.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-0.5 font-mono"
                        >
                          {s.paper} · {s.session} {s.year} Q{s.questionNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
