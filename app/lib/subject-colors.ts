export type SubjectColorProfile = {
  cardBg: string
  shadow: string
  topStripe: string
  iconColor: string
  hex: string
}

const SUBJECT_COLORS: Record<string, SubjectColorProfile> = {
  "0610": { cardBg: "bg-emerald-50", shadow: "shadow-emerald-200", topStripe: "border-t-emerald-500", iconColor: "text-emerald-700", hex: "#059669" },
  "0625": { cardBg: "bg-blue-50",    shadow: "shadow-blue-200",    topStripe: "border-t-blue-500",    iconColor: "text-blue-700",    hex: "#2563EB" },
  "0620": { cardBg: "bg-violet-50",  shadow: "shadow-violet-200",  topStripe: "border-t-violet-500",  iconColor: "text-violet-700",  hex: "#7C3AED" },
  "0580": { cardBg: "bg-orange-50",  shadow: "shadow-orange-200",  topStripe: "border-t-orange-500",  iconColor: "text-orange-700",  hex: "#EA580C" },
  "0500": { cardBg: "bg-rose-50",    shadow: "shadow-rose-200",    topStripe: "border-t-rose-500",    iconColor: "text-rose-700",    hex: "#BE185D" },
  "0478": { cardBg: "bg-cyan-50",    shadow: "shadow-cyan-200",    topStripe: "border-t-cyan-500",    iconColor: "text-cyan-700",    hex: "#0891B2" },
  "0470": { cardBg: "bg-amber-50",   shadow: "shadow-amber-200",   topStripe: "border-t-amber-500",   iconColor: "text-amber-700",   hex: "#D97706" },
  "0460": { cardBg: "bg-teal-50",    shadow: "shadow-teal-200",    topStripe: "border-t-teal-500",    iconColor: "text-teal-700",    hex: "#0D9488" },
}

const DEFAULT_COLORS: SubjectColorProfile = {
  cardBg: "bg-slate-50",
  shadow: "shadow-slate-300",
  topStripe: "border-t-slate-500",
  iconColor: "text-slate-700",
  hex: "#475569",
}

export function getSubjectColors(code: string): SubjectColorProfile {
  return SUBJECT_COLORS[code] ?? DEFAULT_COLORS
}
