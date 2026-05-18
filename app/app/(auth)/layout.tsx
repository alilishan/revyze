import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-bold tracking-tight">
        <span className="text-slate-900">REVY</span>
        <span className="text-indigo-600">ZE</span>
      </Link>
      {children}
    </div>
  )
}
