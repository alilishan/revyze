import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function buildDatasourceUrl() {
  const base = process.env.DATABASE_URL ?? ""
  // In dev, hot-reloads can briefly exhaust the default pool. Cap connections
  // and give a longer wait so session + dashboard queries don't race each other.
  if (process.env.NODE_ENV !== "production") {
    const url = new URL(base)
    url.searchParams.set("connection_limit", "5")
    url.searchParams.set("pool_timeout", "30")
    return url.toString()
  }
  return base
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildDatasourceUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
