"use server"

import { signIn, signOut } from "@/auth"

export async function handleSignIn(formData: FormData) {
  await signIn("resend", {
    email: formData.get("email") as string,
    redirectTo: "/",
  })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}
