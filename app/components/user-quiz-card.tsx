'use client'

import { motion } from 'framer-motion'
import { ScoreRing } from '@/components/score-ring'
import { getSubjectColors } from '@/lib/subject-colors'
import { formatDuration } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Props = {
  attempt: {
    id: string
    score: number
    correctAnswers: number
    totalQuestions: number
    durationSeconds: number
    completedAt: Date | string | null
    quiz: {
      title: string
      subject: {
        id: string
        name: string
        code: string
      }
    }
  }
}

export function UserQuizCard({ attempt }: Props) {
  const colors = getSubjectColors(attempt.quiz.subject.code)

  return (
    <motion.div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 ${colors.topStripe} p-4 flex flex-col gap-3`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Link href={`/dashboard/quiz/${attempt.id}/review`} className="block">
        <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${colors.cardBg} ${colors.iconColor}`}>
          {attempt.quiz.subject.name}
        </span>

        <p className="font-medium text-slate-900 mt-2 line-clamp-1 text-sm">
          {attempt.quiz.title}
        </p>

        <div className="flex items-center gap-3 mt-3">
          <ScoreRing score={attempt.score} hex={colors.hex} size={44} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">
              {attempt.correctAnswers}/{attempt.totalQuestions} · {formatDuration(attempt.durationSeconds)}
            </p>
            <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: colors.hex }}
                initial={{ width: 0 }}
                animate={{ width: `${attempt.score}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 mt-auto">
        <Link
          href={`/dashboard/quiz/start?subjectId=${attempt.quiz.subject.id}`}
          className={cn(
            buttonVariants({ size: 'sm', variant: 'outline' }),
            'flex-1 hover:border-indigo-400 hover:text-indigo-600'
          )}
        >
          Retake
        </Link>
      </div>
    </motion.div>
  )
}
