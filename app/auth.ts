import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"
import { sendVerificationRequest } from "@/lib/auth-email"
import type { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
      sendVerificationRequest,
    }),
  ],
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
