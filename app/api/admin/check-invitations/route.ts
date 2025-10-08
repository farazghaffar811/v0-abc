import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    // Query the invitations collection for unused codes
    const invitationsRef = collection(db, "invitations")
    const q = query(invitationsRef, where("used", "==", false))
    const querySnapshot = await getDocs(q)

    const availableCodes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      availableCodes,
      count: availableCodes.length,
    })
  } catch (error) {
    console.error("Error checking invitations:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check invitations",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
