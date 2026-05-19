'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function GreetingCard({ children }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-4">
      {/* Floating decorative bubbles */}
      <motion.div
        className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full pointer-events-none"
        initial={{ x: 48, y: -48 }}
        animate={prefersReduced ? {} : { y: [-48, -58, -48], x: [48, 44, 48] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/5 rounded-full pointer-events-none"
        initial={{ y: 48 }}
        animate={prefersReduced ? {} : { y: [48, 40, 48] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      {children}
    </section>
  )
}
