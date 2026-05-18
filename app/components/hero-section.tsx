'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

const HEADLINE_WORDS = ["Master", "your", "Cambridge", "IGCSE."]

const TICKER_ITEMS = [
  "Biology", "Physics", "Chemistry", "Mathematics",
  "English", "Computer Science", "History", "Geography",
]

const SAMPLE_CARDS = [
  {
    subject: "Biology",
    pillClass: "bg-emerald-100 text-emerald-700",
    question: "Describe the process of osmosis in plant cells.",
    rotate: -5,
    x: -16,
    yBase: 16,
  },
  {
    subject: "Physics",
    pillClass: "bg-blue-100 text-blue-700",
    question: "State Newton's second law of motion.",
    rotate: 3,
    x: 8,
    yBase: -8,
  },
  {
    subject: "Chemistry",
    pillClass: "bg-violet-100 text-violet-700",
    question: "What is the role of a catalyst in a chemical reaction?",
    rotate: 0,
    x: 0,
    yBase: 0,
  },
]

type Props = {
  isLoggedIn: boolean
}

export function HeroSection({ isLoggedIn }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <>
      <section className="bg-indigo-50">
        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full px-4 py-1.5 text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              200+ Biology questions live · more subjects coming soon
            </div>

            <h1 className="text-4xl lg:text-5xl leading-tight font-medium">
              {HEADLINE_WORDS.map((word, i) => {
                const isLast = i === HEADLINE_WORDS.length - 1
                if (prefersReduced) {
                  return (
                    <span
                      key={word}
                      className={`inline-block mr-[0.3em] ${isLast ? "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" : "text-slate-900"}`}
                    >
                      {word}
                    </span>
                  )
                }
                return (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                    className={`inline-block mr-[0.3em] ${isLast ? "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" : "text-slate-900"}`}
                  >
                    {word}
                  </motion.span>
                )
              })}
            </h1>

            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-slate-500 text-base max-w-xs leading-relaxed"
            >
              Flashcards and quizzes built from real Cambridge past papers — every topic, every year.
            </motion.p>

            <motion.div
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="inline-flex items-center bg-indigo-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-transform"
              >
                Start for free →
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="inline-flex items-center border border-slate-300 bg-white text-slate-700 rounded-xl px-5 py-2.5 text-sm font-medium hover:-translate-y-0.5 transition-transform"
                >
                  Sign in
                </Link>
              )}
            </motion.div>
          </div>

          <div className="relative h-72 hidden lg:flex items-center justify-center">
            {SAMPLE_CARDS.map((card, i) => (
              <motion.div
                key={card.subject}
                className="absolute w-64 bg-white rounded-2xl shadow-xl p-5"
                style={{ rotate: card.rotate, x: card.x, zIndex: SAMPLE_CARDS.length - i }}
                animate={prefersReduced ? {} : {
                  y: [card.yBase, card.yBase - 10, card.yBase],
                }}
                transition={{
                  duration: 5,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${card.pillClass}`}>
                  {card.subject}
                </span>
                <p className="text-slate-700 mt-3 text-sm leading-relaxed">
                  {card.question}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="h-2 bg-slate-100 rounded-full flex-1" />
                  <div className="h-2 w-10 bg-slate-200 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <div className="bg-indigo-900 overflow-hidden py-3">
        <div className="animate-ticker inline-flex gap-16 whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-indigo-200 text-xs font-medium uppercase tracking-widest"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
