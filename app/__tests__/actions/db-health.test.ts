import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe("checkDbConnection", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("returns connected: true and a success message when the query succeeds", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValue([{ 1: 1 }])

    const { checkDbConnection } = await import("@/actions/db-health")
    const result = await checkDbConnection()

    expect(result.connected).toBe(true)
    expect(result.message).toBe("Database connection successful")
    expect(typeof result.checkedAt).toBe("string")
    expect(() => new Date(result.checkedAt)).not.toThrow()
  })

  it("returns connected: false with the error message when the query throws", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("ECONNREFUSED 127.0.0.1:3306")
    )

    const { checkDbConnection } = await import("@/actions/db-health")
    const result = await checkDbConnection()

    expect(result.connected).toBe(false)
    expect(result.message).toBe("ECONNREFUSED 127.0.0.1:3306")
    expect(typeof result.checkedAt).toBe("string")
  })

  it("returns connected: false with a fallback message when a non-Error is thrown", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValue("string error")

    const { checkDbConnection } = await import("@/actions/db-health")
    const result = await checkDbConnection()

    expect(result.connected).toBe(false)
    expect(result.message).toBe("Unknown database error")
  })
})
