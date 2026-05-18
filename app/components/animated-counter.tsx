'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

type Props = {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, suffix = '', duration = 800, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!ref.current) return
    if (prefersReduced) {
      ref.current.textContent = `${value}${suffix}`
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      if (ref.current) {
        ref.current.textContent = `${Math.round(eased * value)}${suffix}`
      }
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, suffix, duration, prefersReduced])

  return (
    <span ref={ref} className={className}>
      {value}{suffix}
    </span>
  )
}
