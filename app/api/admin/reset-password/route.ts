import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { uid, newPassword } = await request.json()

    if (!uid || !newPassword) {
      return NextResponse.json({ success: false, message: "User ID and new password are required" }, { status: 400 })
    }

    // Update the user's password using Firebase Admin SDK
    await adminAuth.updateUser(uid, {
      password: newPassword,
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error updating user password:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update password",
      },
      { status: 500 },
    )
  }
}
