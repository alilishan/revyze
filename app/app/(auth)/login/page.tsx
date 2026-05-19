import { LoginForm } from "./login-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 w-full max-w-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
      <p className="text-slate-500 text-sm mb-6">
        Enter your email and we&apos;ll send you a sign-in link.
      </p>

      <LoginForm />

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-indigo-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
