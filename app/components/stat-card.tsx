import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Props = {
  icon: LucideIcon
  label: string
  iconClass: string
  children: React.ReactNode
}

export function StatCard({ icon: Icon, label, iconClass, children }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn("rounded-xl p-1.5 sm:p-2 shrink-0", iconClass)}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="min-w-0">
          {children}
          <p className="text-slate-500 text-xs truncate">{label}</p>
        </div>
      </div>
    </div>
  )
}
