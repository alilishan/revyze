'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import React, { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  staggerMs?: number
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: (staggerSec: number) => ({
    transition: { staggerChildren: staggerSec },
  }),
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function AnimatedCards({ children, staggerMs = 50, className }: Props) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      custom={staggerMs / 1000}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
