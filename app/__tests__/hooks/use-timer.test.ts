import { describe, it, expect } from "vitest"
import { formatTime } from "@/hooks/use-timer"

describe("formatTime", () => {
  it("formats seconds under 60 as 0:ss", () => {
    expect(formatTime(0)).toBe("0:00")
    expect(formatTime(9)).toBe("0:09")
    expect(formatTime(59)).toBe("0:59")
  })

  it("formats seconds >= 60 as m:ss", () => {
    expect(formatTime(60)).toBe("1:00")
    expect(formatTime(64)).toBe("1:04")
    expect(formatTime(602)).toBe("10:02")
  })
})
