'use client'

import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type ToggleGroupProps = {
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[], event: unknown) => void
  multiple?: boolean
  className?: string
  children?: ReactNode
}

type ToggleProps = {
  value?: string
  className?: string
  children?: ReactNode
  disabled?: boolean
}

export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <BaseToggleGroup
      className={cn('flex bg-slate-100 rounded-lg p-1 gap-1 items-center', className)}
      {...(props as Parameters<typeof BaseToggleGroup>[0])}
    />
  )
}

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <BaseToggle
      className={cn(
        'flex items-center gap-1',
        'rounded-md px-3 py-1.5 text-xs text-slate-500 transition-all cursor-pointer select-none',
        'data-pressed:bg-white data-pressed:text-slate-900 data-pressed:font-semibold data-pressed:shadow-sm',
        'hover:bg-white/50',
        className,
      )}
      {...(props as Parameters<typeof BaseToggle>[0])}
    />
  )
}
