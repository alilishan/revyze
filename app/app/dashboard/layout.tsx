import { auth } from "@/auth"
import { handleSignOut } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const displayName = session.user.name ?? session.user.email

  return (
    <div className="min-h-screen bg-indigo-50">
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-medium text-lg tracking-tight">
            <span className="text-slate-900">REVY</span>
            <span className="text-indigo-600">ZE</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-700 hidden sm:block"
            >
              Dashboard
            </Link>
            <span className="text-sm text-slate-400 hidden md:block">
              {displayName}
            </span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
