"use client"

import { useState, useEffect } from "react"

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function useTimer(startedAt: Date): { elapsed: number; formatted: string } {
  const [elapsed, setElapsed] = useState(() =>
    Math.round((Date.now() - startedAt.getTime()) / 1000)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return { elapsed, formatted: formatTime(elapsed) }
}
