"use server"

import { prisma } from "@/lib/prisma"

export type DbHealthResult = {
  connected: boolean
  message: string
  checkedAt: string
}

export async function checkDbConnection(): Promise<DbHealthResult> {
  const checkedAt = new Date().toISOString()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, message: "Database connection successful", checkedAt }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error"
    return { connected: false, message, checkedAt }
  }
}
