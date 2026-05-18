import type { Metadata } from "next"
import Link from "next/link"
import { PiEnvelopeSimple } from "react-icons/pi"

export const metadata: Metadata = {
  title: "Check your email",
}

export default function VerifyPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm text-center">
      <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <PiEnvelopeSimple className="text-2xl text-indigo-600" />
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-2">Check your email</h1>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        We sent you a sign-in link. Click it to access your Revyze account.
        The link expires in <span className="text-slate-700 font-medium">10 minutes</span>.
      </p>

      <p className="text-xs text-slate-400 leading-relaxed">
        Didn&apos;t receive it? Check your spam folder, or{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          try again
        </Link>
        .
      </p>
    </div>
  )
}
