import { RegisterForm } from "./register-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Create Account",
}

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 w-full max-w-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Create your account</h1>
      <p className="text-slate-500 text-sm mb-6">
        Sign up for free — we&apos;ll send you a magic link to get started.
      </p>

      <RegisterForm />

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
