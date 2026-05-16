import { stripHtml } from './html'

export type FlashcardSource = {
  paper: string
  year: string
  session: string
  questionNumber: string
}

export type QuestionCard = {
  id: string
  question: string
  answer: string
  explanation: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  frequency: number
  imageUrl: string | null
  topic: { name: string } | null
  topicId: string | null
  sources: FlashcardSource[]
}

export type FilterState = {
  search: string
  sort: 'frequency' | 'year'
  topicId: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null
  year: string | null
}

function maxSourceYear(sources: FlashcardSource[]): number {
  if (sources.length === 0) return 0
  return Math.max(...sources.map((s) => parseInt(s.year, 10)))
}

export function filterQuestions(cards: QuestionCard[], filters: FilterState): QuestionCard[] {
  let result = [...cards]

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter((c) => stripHtml(c.question).toLowerCase().includes(q))
  }

  if (filters.topicId) {
    result = result.filter((c) => c.topicId === filters.topicId)
  }

  if (filters.difficulty) {
    result = result.filter((c) => c.difficulty === filters.difficulty)
  }

  if (filters.year) {
    result = result.filter((c) => c.sources.some((s) => s.year === filters.year))
  }

  if (filters.sort === 'frequency') {
    result.sort((a, b) => b.frequency - a.frequency || a.id.localeCompare(b.id))
  } else {
    result.sort((a, b) => maxSourceYear(b.sources) - maxSourceYear(a.sources) || a.id.localeCompare(b.id))
  }

  return result
}
