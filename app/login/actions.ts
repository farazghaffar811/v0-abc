"use server"

import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export async function loginUser(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password)
    return { success: true }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: error.message || "Login failed" }
  }
}
