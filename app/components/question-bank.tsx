'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { filterQuestions, type QuestionCard, type FilterState } from '@/lib/filter-questions'
import { HtmlContent } from '@/components/html-content'
import { AnswerDrawer } from '@/components/answer-drawer'
import { ToggleGroup, Toggle } from '@/components/ui/toggle-group'

const DIFF_STYLES = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

export function QuestionBank({ flashcards }: { flashcards: QuestionCard[] }) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: 'frequency',
    topicId: null,
    difficulty: null,
    year: null,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!filtersOpen) return
    function handleClick(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filtersOpen])

  const topics = useMemo(() => {
    const map = new Map<string, string>()
    flashcards.forEach((c) => {
      if (c.topicId && c.topic) map.set(c.topicId, c.topic.name)
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [flashcards])

  const allYears = useMemo(() => {
    const set = new Set<string>()
    flashcards.forEach((c) => c.sources.forEach((s) => set.add(s.year)))
    return Array.from(set).sort((a, b) => parseInt(b) - parseInt(a))
  }, [flashcards])

  const filtered = useMemo(() => filterQuestions(flashcards, filters), [flashcards, filters])

  const selectedCard = useMemo(
    () => flashcards.find((c) => c.id === selectedId) ?? null,
    [flashcards, selectedId],
  )

  const activeFilterCount = [filters.topicId, filters.difficulty, filters.year].filter(Boolean).length

  const clearFilters = useCallback(() => {
    setFilters((f) => ({ ...f, topicId: null, difficulty: null, year: null }))
  }, [])

  return (
    <div className="flex gap-5 items-start">
      {/* Left: filter bar + list */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">

          {/* Row 1: Search + Filters button */}
          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:border-slate-400 transition-colors">
              <span className="text-slate-400 text-sm" aria-hidden="true">🔍</span>
              <input
                type="text"
                placeholder="Search questions…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <div ref={filtersRef} className="relative">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <span>⚙</span>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-slate-900 text-white rounded-full px-1.5 text-xs font-bold leading-5">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 z-10 flex flex-col gap-4">
                  {/* Topic */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Topic
                    </label>
                    <select
                      value={filters.topicId ?? ''}
                      onChange={(e) => setFilters((f) => ({ ...f, topicId: e.target.value || null }))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 bg-white"
                    >
                      <option value="">All topics</option>
                      {topics.map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Difficulty
                    </p>
                    <div className="flex gap-1">
                      {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setFilters((f) => ({ ...f, difficulty: f.difficulty === d ? null : d }))
                          }
                          className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors ${
                            filters.difficulty === d
                              ? DIFF_STYLES[d] + ' border-transparent'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {d[0] + d.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Year
                    </label>
                    <select
                      value={filters.year ?? ''}
                      onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value || null }))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 bg-white"
                    >
                      <option value="">All years</option>
                      {allYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => { clearFilters(); setFiltersOpen(false) }}
                    className="text-xs text-slate-400 hover:text-slate-600 text-left underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Sort + result count */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort</span>
            <ToggleGroup
              value={[filters.sort]}
              onValueChange={(values: string[]) => {
                const next = values[0] as FilterState['sort']
                if (next) setFilters((f) => ({ ...f, sort: next }))
              }}
            >
              <Toggle value="frequency">⭐ Most Frequent</Toggle>
              <Toggle value="year">📅 Latest Year</Toggle>
            </ToggleGroup>
            <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Row 3: Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              {filters.topicId && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-0.5 text-xs text-slate-600">
                  {topics.find(([id]) => id === filters.topicId)?.[1]}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, topicId: null }))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Remove topic filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.difficulty && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-0.5 text-xs text-slate-600">
                  {filters.difficulty[0] + filters.difficulty.slice(1).toLowerCase()}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, difficulty: null }))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Remove difficulty filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.year && (
                <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-0.5 text-xs text-slate-600">
                  {filters.year}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, year: null }))}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Remove year filter"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Question cards ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400 text-sm">
            No questions match your filters.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((card) => {
              const uniqueYears = [...new Set(card.sources.map((s) => s.year))]
                .sort((a, b) => parseInt(b) - parseInt(a))
                .slice(0, 4)
              const isSelected = card.id === selectedId

              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedId(isSelected ? null : card.id)}
                  className={`text-left bg-white rounded-2xl border p-4 transition-all hover:border-slate-400 hover:shadow-sm ${
                    isSelected ? 'border-slate-900 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {card.topic?.name ?? 'Uncategorised'}
                    </span>
                    {card.frequency > 0 && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 ml-2 shrink-0">
                        ⭐ {card.frequency}×
                      </span>
                    )}
                  </div>

                  <HtmlContent
                    html={card.question}
                    className="text-sm font-semibold text-slate-900 leading-relaxed [&_ul]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-0.5 [&_li]:font-normal [&_li]:text-slate-700"
                  />

                  <div className="flex gap-2 flex-wrap items-center mt-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLES[card.difficulty]}`}>
                      {card.difficulty[0] + card.difficulty.slice(1).toLowerCase()}
                    </span>
                    {uniqueYears.map((y) => (
                      <span
                        key={y}
                        className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 font-mono"
                      >
                        {y}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: answer drawer */}
      <AnswerDrawer card={selectedCard} onClose={() => setSelectedId(null)} />
    </div>
  )
}
