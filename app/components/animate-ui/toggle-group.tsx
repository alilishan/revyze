'use client'

import { useState, useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type ToggleOption<T extends string = string> = {
  value: T
  label: React.ReactNode
}

type Props<T extends string> = {
  name: string
  defaultValue: T
  options: ToggleOption<T>[]
  /** Override the container — defaults to horizontal flex strip. Use 'grid grid-cols-N' to switch layout. */
  className?: string
  itemClassName?: string
}

export function ToggleGroup<T extends string>({
  name,
  defaultValue,
  options,
  className,
  itemClassName,
}: Props<T>) {
  const [selected, setSelected] = useState<T>(defaultValue)
  const layoutId = useId()

  return (
    <div className={cn('flex gap-1 rounded-xl bg-slate-100 p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setSelected(opt.value)}
          className={cn(
            'relative flex-1 flex flex-col items-center gap-1 rounded-lg py-2.5 px-2 text-sm font-medium transition-colors duration-150',
            selected === opt.value
              ? 'text-white'
              : 'text-slate-500 hover:text-slate-700',
            itemClassName,
          )}
        >
          {selected === opt.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-indigo-600 rounded-lg"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex flex-col items-center gap-1 w-full text-center">
            {opt.label}
          </span>
        </button>
      ))}
      <input type="hidden" name={name} value={selected} />
    </div>
  )
}
