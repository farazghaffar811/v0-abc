import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  console.log("POST /api/create-user-profile - Start")
  try {
    const userProfile = await request.json()

    if (!userProfile.uid) {
      console.error("UID is required but not provided")
      return NextResponse.json({ error: "UID is required" }, { status: 400 })
    }

    console.log(`Creating user profile for UID: ${userProfile.uid}`)
    await adminDb.collection("users").doc(userProfile.uid).set(userProfile)

    console.log("User profile created successfully")
    return NextResponse.json({ message: "User profile created successfully" })
  } catch (error) {
    console.error("Error creating user profile:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      {
        error: "Failed to create user profile",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  } finally {
    console.log("POST /api/create-user-profile - End")
  }
}
