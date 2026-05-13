import { auth } from "@/auth"
import { handleSignOut } from "@/actions/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-bold text-slate-900 tracking-tight"
          >
            IGCSE FlashCards
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Dashboard
            </Link>
            <span className="text-sm text-slate-400 hidden sm:block">
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
