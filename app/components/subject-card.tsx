'use client'

import { motion } from 'framer-motion'
import {
  PiDna,
  PiLightning,
  PiFlask,
  PiMathOperations,
  PiBookOpenText,
  PiCode,
  PiClockCounterClockwise,
  PiGlobeHemisphereWest,
} from 'react-icons/pi'
import { getSubjectColors } from '@/lib/subject-colors'
import { nameToSlug } from '@/lib/subject-slug'
import Link from 'next/link'
import type { IconType } from 'react-icons'

const SUBJECT_ICONS: Record<string, IconType> = {
  "0610": PiDna,
  "0625": PiLightning,
  "0620": PiFlask,
  "0580": PiMathOperations,
  "0500": PiBookOpenText,
  "0478": PiCode,
  "0470": PiClockCounterClockwise,
  "0460": PiGlobeHemisphereWest,
}

type Props = {
  subject: {
    id: string
    name: string
    code: string
    _count: { flashcards: number }
  }
}

export function SubjectCard({ subject }: Props) {
  const colors = getSubjectColors(subject.code)
  const Icon = SUBJECT_ICONS[subject.code] ?? PiBookOpenText
  const hasCards = subject._count.flashcards > 0

  return (
    <motion.div
      className={`${colors.cardBg} shadow-sm ${colors.shadow} rounded-xl  p-4 flex flex-col gap-3 h-full`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div>
        <Icon className={`text-2xl ${colors.iconColor}`} />
        <p className="font-medium text-sm mt-2 text-slate-900">
          {subject.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hasCards ? `${subject._count.flashcards} cards` : "Coming soon"}
        </p>
      </div>

      {hasCards && (
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/dashboard/${nameToSlug(subject.name)}/questions`}
            className="flex-1 text-center text-xs font-medium text-slate-600 bg-white/70 hover:bg-white border border-slate-200/60 rounded-lg py-1.5 transition-colors"
          >
            Questions
          </Link>
          <Link
            href="/dashboard/quiz/start"
            className="flex-1 text-center text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition-colors"
          >
            Quiz →
          </Link>
        </div>
      )}
    </motion.div>
  )
}
