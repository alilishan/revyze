import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"
import { sendVerificationRequest } from "@/lib/auth-email"
import { Prisma, type Role } from "@prisma/client"
import type { Adapter, AdapterSession } from "next-auth/adapters"

const prismaAdapter = PrismaAdapter(prisma)

const adapter: Adapter = {
  ...prismaAdapter,
  // Signing out with a session cookie whose row is already gone — a second
  // sign-out, a refreshed sign-out POST, or a row removed server-side — makes
  // the Prisma adapter throw P2025. Auth.js turns that into an
  // "error=Configuration" page even though the user is, by then, signed out.
  // A missing row is the desired end state, so treat it as success.
  async deleteSession(sessionToken): Promise<AdapterSession | undefined> {
    try {
      return (await prismaAdapter.deleteSession!(sessionToken)) ?? undefined
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return undefined
      }
      throw error
    }
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
      sendVerificationRequest,
    }),
  ],
  pages: {
    verifyRequest: "/verify",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as { id: string; role: Role }).role
      return session
    },
  },
  events: {
    // When Auth.js creates a new user (e.g. first sign-in via /login with no
    // prior upsert), fall back to the email prefix so name is never null.
    async createUser({ user }) {
      if (!user.name && user.email) {
        const fallback = user.email.split("@")[0]
        await prisma.user.update({
          where: { id: user.id },
          data: { name: fallback },
        })
      }
    },
  },
})
