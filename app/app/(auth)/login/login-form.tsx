'use client'

import { handleSignIn } from "@/actions/auth"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/submit-button"

export function LoginForm() {
  return (
    <form action={handleSignIn} className="space-y-4">
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
        Send sign-in link
      </SubmitButton>
    </form>
  )
}
