'use client'

import { motion } from 'framer-motion'
import { Library, FileCheck2, TrendingUp } from 'lucide-react'

const FEATURES = [
  {
    icon: Library,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    stat: '8 subjects',
    title: 'Full curriculum',
    description: 'Covers the complete Cambridge IGCSE curriculum — Sciences, Maths, Humanities, and Languages.',
  },
  {
    icon: FileCheck2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    stat: '200+ Qs',
    title: 'Past-paper questions',
    description: 'Every flashcard is derived from real past papers with cross-year frequency analysis.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    stat: '∞ Practice',
    title: 'Track progress',
    description: 'Score history, time-per-quiz, and per-question breakdowns stored for every student.',
  },
]

export function FeatureCards() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-12 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {FEATURES.map((f) => {
        const Icon = f.icon
        return (
          <motion.div
            key={f.title}
            className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 flex flex-col gap-3"
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={`${f.iconBg} ${f.iconColor} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-medium text-slate-900">{f.stat}</p>
            <div>
              <h3 className="font-medium text-slate-900 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.description}</p>
            </div>
          </motion.div>
        )
      })}
    </section>
  )
}
