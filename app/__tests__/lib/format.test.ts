import { describe, it, expect } from "vitest"
import { formatDuration } from "@/lib/format"

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
