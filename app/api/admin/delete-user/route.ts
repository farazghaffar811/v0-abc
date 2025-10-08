import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 })
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid)

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        error: "Failed to delete user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
