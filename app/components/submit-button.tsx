'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type Props = ComponentProps<typeof Button> & {
  loadingText?: string
}

export function SubmitButton({ children, loadingText, className, disabled, ...props }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className={cn("relative", className)}
      {...props}
    >
      {pending ? (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
          <span className="invisible">{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
