import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST() {
  try {
    console.log("Starting credit score fix via API...")

    const usersRef = adminDb.collection("users")
    const snapshot = await usersRef.get()

    let updatedCount = 0
    const updates: any[] = []

    for (const doc of snapshot.docs) {
      const userData = doc.data()
      const userUpdates: any = {}

      // Fix credit score if it's null, undefined, or NaN
      if (!userData.creditScore || userData.creditScore === null || isNaN(userData.creditScore)) {
        userUpdates.creditScore = 100 // Default credit score
      }

      // Fix reputation if it's null, undefined, or NaN
      if (!userData.reputation || userData.reputation === null || isNaN(userData.reputation)) {
        userUpdates.reputation = 100 // Default reputation
      }

      // Apply updates if any
      if (Object.keys(userUpdates).length > 0) {
        await doc.ref.update(userUpdates)
        updatedCount++
        updates.push({
          email: userData.email,
          updates: userUpdates,
        })
        console.log(`Updated user ${userData.email} with:`, userUpdates)
      }
    }

    console.log(`Credit score fix completed. Updated ${updatedCount} users.`)

    return NextResponse.json({
      success: true,
      updatedCount,
      updates,
      message: `Successfully fixed credit scores for ${updatedCount} users`,
    })
  } catch (error) {
    console.error("Error fixing credit scores:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to fix credit scores",
      },
      { status: 500 },
    )
  }
}
