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
  PiListBullets,
  PiPlay,
} from 'react-icons/pi'
import { getSubjectColors } from '@/lib/subject-colors'
import { nameToSlug } from '@/lib/subject-slug'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
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
      className={`${colors.cardBg} shadow-sm ${colors.shadow} rounded-xl p-3 flex items-center gap-3`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Icon className={`text-2xl shrink-0 ${colors.iconColor}`} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate leading-tight">
          {subject.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hasCards ? `${subject._count.flashcards} cards` : "Coming soon"}
        </p>
      </div>

      {hasCards && (
        <TooltipProvider>
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/dashboard/${nameToSlug(subject.name)}/questions`}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white/70 hover:text-slate-700 transition-colors"
                  />
                }
              >
                <PiListBullets className="text-base" />
              </TooltipTrigger>
              <TooltipContent>Browse questions</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/dashboard/quiz/start?subjectId=${subject.id}`}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  />
                }
              >
                <PiPlay className="text-base" />
              </TooltipTrigger>
              <TooltipContent>Start quiz</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}
    </motion.div>
  )
}
