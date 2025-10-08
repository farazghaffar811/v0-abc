import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST() {
  try {
    console.log("Starting user cleanup...")

    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection("users").get()
    console.log(`Found ${usersSnapshot.docs.length} users in Firestore`)

    const usersToDelete = []

    // Check each user in Firestore against Firebase Auth
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const uid = userDoc.id

      try {
        // Try to get user from Firebase Auth
        await adminAuth.getUser(uid)
        console.log(`✓ User ${userData.email} exists in Auth`)
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          console.log(`✗ User ${userData.email} (${uid}) not found in Auth - marking for deletion`)
          usersToDelete.push({ uid, email: userData.email })
        } else {
          console.error(`Error checking user ${userData.email}:`, error)
        }
      }
    }

    console.log(`Found ${usersToDelete.length} users to delete from Firestore`)

    // Delete users from Firestore
    let deletedCount = 0
    for (const user of usersToDelete) {
      try {
        await adminDb.collection("users").doc(user.uid).delete()
        console.log(`✓ Deleted ${user.email} from Firestore`)
        deletedCount++
      } catch (error) {
        console.error(`✗ Failed to delete ${user.email} from Firestore:`, error)
      }
    }

    console.log(`Cleanup completed! Deleted ${deletedCount} users`)

    return NextResponse.json({
      success: true,
      message: "User cleanup completed",
      deletedCount,
      totalChecked: usersSnapshot.docs.length,
    })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json(
      {
        error: "Failed to cleanup users",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
