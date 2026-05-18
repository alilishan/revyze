'use client'

import { useEffect, useRef } from 'react'

const RADIUS = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type Props = {
  score: number
  hex: string
  size?: number
}

export function ScoreRing({ score, hex, size = 44 }: Props) {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!circleRef.current) return
    const target = CIRCUMFERENCE * (1 - score / 100)
    requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 1000ms ease-out'
        circleRef.current.style.strokeDashoffset = String(target)
      }
    })
  }, [score])

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label={`Score: ${score}%`}>
      <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="4" />
      <circle
        ref={circleRef}
        cx="18"
        cy="18"
        r={RADIUS}
        fill="none"
        stroke={hex}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE}
        transform="rotate(-90 18 18)"
      />
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontSize="8"
        fontWeight="500"
        fill={hex}
        fontFamily="Poppins, sans-serif"
      >
        {score}%
      </text>
    </svg>
  )
}
