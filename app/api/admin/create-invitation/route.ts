import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

function generateInviteCode(length = 6): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
}

export async function POST(request: Request) {
  try {
    const code = generateInviteCode()
    const invitationsRef = collection(db, "invitations")

    await addDoc(invitationsRef, {
      code,
      createdAt: serverTimestamp(),
      used: false,
    })

    return NextResponse.json({
      success: true,
      code,
      message: "Invitation code created successfully",
    })
  } catch (error) {
    console.error("Error creating invitation code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create invitation code",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
