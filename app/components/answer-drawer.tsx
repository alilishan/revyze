'use client'

import { useEffect } from 'react'
import type { QuestionCard } from '@/lib/filter-questions'
import { HtmlContent } from '@/components/html-content'

const DIFF_STYLES = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

type Props = {
  card: QuestionCard | null
  onClose: () => void
}

function DrawerContent({ card, onClose }: Props) {
  if (!card) return null

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const years = card.sources.map((s) => parseInt(s.year, 10))
  const minYear = years.length > 0 ? Math.min(...years) : null
  const maxYear = years.length > 0 ? Math.max(...years) : null
  const yearRange =
    minYear && maxYear
      ? minYear === maxYear
        ? String(minYear)
        : `${minYear}–${maxYear}`
      : null

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {card.topic && (
            <span className="text-xs text-slate-500 font-medium">{card.topic.name}</span>
          )}
          {card.frequency > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              ⭐ {card.frequency}×
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600 text-lg leading-none shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Question */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Question</p>
        <HtmlContent
          html={card.question}
          className="text-sm font-semibold text-slate-900 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1 [&_li]:font-normal [&_li]:text-slate-700"
        />
      </div>

      {card.imageUrl && (
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <img src={`/flashcard-images/${card.imageUrl}`} alt="Exam diagram" className="w-full" />
        </div>
      )}

      <div className="border-t border-slate-100" />

      {/* Answer */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Answer</p>
        <HtmlContent
          html={card.answer}
          className="text-sm text-slate-700 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1"
        />
        {card.explanation && (
          <HtmlContent
            html={card.explanation}
            className="mt-3 text-sm text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-3 [&_ul]:mt-1 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5"
          />
        )}
      </div>

      {/* Sources */}
      {card.sources.length > 0 && (
        <>
          <div className="border-t border-slate-100" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Past Paper Sources
            </p>
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
          </div>
        </>
      )}

      <div className="border-t border-slate-100" />

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${DIFF_STYLES[card.difficulty]}`}>
          {card.difficulty[0] + card.difficulty.slice(1).toLowerCase()}
        </span>
        {card.frequency > 0 && yearRange && (
          <span className="text-xs text-slate-500">
            Appeared {card.frequency} time{card.frequency !== 1 ? 's' : ''} in past papers ({yearRange})
          </span>
        )}
      </div>
    </div>
  )
}

export function AnswerDrawer({ card, onClose }: Props) {
  return (
    <>
      {/* Desktop: sticky right panel */}
      <div className="hidden md:block w-96 shrink-0">
        <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 max-h-[calc(100vh-5.5rem)] overflow-y-auto">
          {card ? (
            <DrawerContent card={card} onClose={onClose} />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm px-6 text-center">
              Click a question to see the answer
            </div>
          )}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      {card && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col overflow-y-auto">
            <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <DrawerContent card={card} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  )
}
