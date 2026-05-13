"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function handleSignIn(formData: FormData) {
  await signIn("resend", {
    email: formData.get("email") as string,
    redirectTo: "/",
  })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}

export async function handleRegister(formData: FormData) {
  const name = (formData.get("name") as string)?.trim() || null
  const email = (formData.get("email") as string)?.trim()

  // Pre-create/update the user so the name is stored before the magic link
  // verification fires. If the user already exists their name is updated.
  await prisma.user.upsert({
    where: { email },
    update: { ...(name && { name }) },
    create: { email, name },
  })

  await signIn("resend", { email, redirectTo: "/" })
}
