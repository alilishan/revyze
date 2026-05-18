import { describe, it, expect } from "vitest"
import { getSubjectColors } from "@/lib/subject-colors"

describe("getSubjectColors", () => {
  it("returns Biology (emerald) colors for code 0610", () => {
    const c = getSubjectColors("0610")
    expect(c.cardBg).toBe("bg-emerald-50")
    expect(c.border).toBe("border-emerald-200")
    expect(c.topStripe).toBe("border-t-emerald-500")
    expect(c.iconColor).toBe("text-emerald-700")
    expect(c.hex).toBe("#059669")
  })

  it("returns Physics (blue) colors for code 0625", () => {
    const c = getSubjectColors("0625")
    expect(c.cardBg).toBe("bg-blue-50")
    expect(c.hex).toBe("#2563EB")
  })

  it("returns default (slate) colors for an unknown code", () => {
    const c = getSubjectColors("9999")
    expect(c.cardBg).toBe("bg-slate-50")
    expect(c.border).toBe("border-slate-200")
    expect(c.hex).toBe("#475569")
  })
})
