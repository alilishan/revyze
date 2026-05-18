import { describe, it, expect } from "vitest"
import { formatDuration, formatRelativeTime } from "@/lib/format"

describe("formatDuration", () => {
  it("returns seconds-only for values under 60", () => {
    expect(formatDuration(45)).toBe("45s")
    expect(formatDuration(0)).toBe("0s")
    expect(formatDuration(59)).toBe("59s")
  })

  it("returns minutes and seconds for values 60 and above", () => {
    expect(formatDuration(60)).toBe("1m 0s")
    expect(formatDuration(83)).toBe("1m 23s")
    expect(formatDuration(3661)).toBe("61m 1s")
  })
})

describe("formatRelativeTime", () => {
  it("returns 'just now' for dates within 60 seconds", () => {
    expect(formatRelativeTime(new Date(Date.now() - 30_000))).toBe("just now")
    expect(formatRelativeTime(new Date(Date.now() - 0))).toBe("just now")
  })

  it("returns minutes for sub-hour dates", () => {
    expect(formatRelativeTime(new Date(Date.now() - 5 * 60_000))).toBe("5m ago")
    expect(formatRelativeTime(new Date(Date.now() - 59 * 60_000))).toBe("59m ago")
  })

  it("returns hours for sub-day dates", () => {
    expect(formatRelativeTime(new Date(Date.now() - 3 * 3_600_000))).toBe("3h ago")
    expect(formatRelativeTime(new Date(Date.now() - 23 * 3_600_000))).toBe("23h ago")
  })

  it("returns 'yesterday' for dates 24-47 hours ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 25 * 3_600_000))).toBe("yesterday")
  })

  it("returns days for dates 2+ days ago", () => {
    expect(formatRelativeTime(new Date(Date.now() - 3 * 86_400_000))).toBe("3 days ago")
  })
})
