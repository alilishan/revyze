import { describe, it, expect } from 'vitest'
import { filterQuestions } from './filter-questions'
import type { QuestionCard, FilterState } from './filter-questions'

const cards: QuestionCard[] = [
  {
    id: '1',
    question: '<p>What is MRS GREN?</p>',
    answer: 'answer',
    explanation: null,
    difficulty: 'EASY',
    frequency: 8,
    imageUrl: null,
    topic: { name: 'Classification' },
    topicId: 'topic-a',
    sources: [{ paper: 'p1', year: '2020', session: 'May', questionNumber: '1' }],
  },
  {
    id: '2',
    question: '<p>Aerobic vs anaerobic</p>',
    answer: 'answer',
    explanation: null,
    difficulty: 'HARD',
    frequency: 4,
    imageUrl: null,
    topic: { name: 'Respiration' },
    topicId: 'topic-b',
    sources: [{ paper: 'p2', year: '2022', session: 'Jun', questionNumber: '3' }],
  },
  {
    id: '3',
    question: '<ul><li>Option A</li><li>Option B</li></ul>',
    answer: 'answer',
    explanation: null,
    difficulty: 'MEDIUM',
    frequency: 6,
    imageUrl: null,
    topic: { name: 'Respiration' },
    topicId: 'topic-b',
    sources: [{ paper: 'p1', year: '2021', session: 'May', questionNumber: '2' }],
  },
]

const defaults: FilterState = {
  search: '',
  sort: 'frequency',
  topicId: null,
  difficulty: null,
  year: null,
}

describe('filterQuestions', () => {
  it('returns all cards sorted by frequency desc with no filters', () => {
    const result = filterQuestions(cards, defaults)
    expect(result.map((c) => c.id)).toEqual(['1', '3', '2'])
  })

  it('filters by search term, stripping HTML tags', () => {
    const result = filterQuestions(cards, { ...defaults, search: 'Option A' })
    expect(result.map((c) => c.id)).toEqual(['3'])
  })

  it('search is case-insensitive', () => {
    const result = filterQuestions(cards, { ...defaults, search: 'mrs gren' })
    expect(result.map((c) => c.id)).toEqual(['1'])
  })

  it('filters by topicId', () => {
    const result = filterQuestions(cards, { ...defaults, topicId: 'topic-b' })
    expect(result.map((c) => c.id)).toEqual(['3', '2'])
  })

  it('filters by difficulty', () => {
    const result = filterQuestions(cards, { ...defaults, difficulty: 'HARD' })
    expect(result.map((c) => c.id)).toEqual(['2'])
  })

  it('filters by year (matches any source year)', () => {
    const result = filterQuestions(cards, { ...defaults, year: '2022' })
    expect(result.map((c) => c.id)).toEqual(['2'])
  })

  it('sorts by latest source year desc when sort=year', () => {
    const result = filterQuestions(cards, { ...defaults, sort: 'year' })
    expect(result.map((c) => c.id)).toEqual(['2', '3', '1'])
  })

  it('returns empty array when no cards match', () => {
    const result = filterQuestions(cards, { ...defaults, search: 'photosynthesis' })
    expect(result).toEqual([])
  })
})
