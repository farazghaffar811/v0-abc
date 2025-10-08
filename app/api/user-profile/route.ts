import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  console.log("GET /api/user-profile - Start")
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get("uid")

  console.log("Received request for user profile. UID:", uid)

  if (!uid) {
    console.error("UID is required but not provided")
    return NextResponse.json({ error: "UID is required" }, { status: 400 })
  }

  try {
    console.log(`Fetching user profile for UID: ${uid}`)

    if (!adminDb) {
      console.error("adminDb is not initialized")
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 })
    }

    console.log("Attempting to get user document from Firestore")
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      console.log(`User not found for UID: ${uid}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    console.log(`User data fetched successfully for UID: ${uid}`)
    console.log("User data:", JSON.stringify(userData, null, 2))
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  } finally {
    console.log("GET /api/user-profile - End")
  }
}
