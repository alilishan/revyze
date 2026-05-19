'use client'

import { handleRegister } from "@/actions/auth"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/submit-button"

export function RegisterForm() {
  return (
    <form action={handleRegister} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
      <SubmitButton className="w-full" loadingText="Sending…">
        Send magic link
      </SubmitButton>
    </form>
  )
}
