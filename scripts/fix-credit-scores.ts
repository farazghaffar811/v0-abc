import { adminDb } from "../lib/firebase-admin"

async function fixCreditScores() {
  try {
    console.log("Starting credit score fix...")

    const usersRef = adminDb.collection("users")
    const snapshot = await usersRef.get()

    let updatedCount = 0

    for (const doc of snapshot.docs) {
      const userData = doc.data()
      const updates: any = {}

      // Fix credit score if it's null, undefined, or NaN
      if (!userData.creditScore || userData.creditScore === null || isNaN(userData.creditScore)) {
        updates.creditScore = 100 // Default credit score
        console.log(`Fixing credit score for user: ${userData.email}`)
      }

      // Fix reputation if it's null, undefined, or NaN
      if (!userData.reputation || userData.reputation === null || isNaN(userData.reputation)) {
        updates.reputation = 100 // Default reputation
        console.log(`Fixing reputation for user: ${userData.email}`)
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates)
        updatedCount++
        console.log(`Updated user ${userData.email} with:`, updates)
      }
    }

    console.log(`Credit score fix completed. Updated ${updatedCount} users.`)
    return { success: true, updatedCount }
  } catch (error) {
    console.error("Error fixing credit scores:", error)
    return { success: false, error }
  }
}

// Run the fix
fixCreditScores()
  .then((result) => {
    console.log("Fix result:", result)
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fix failed:", error)
    process.exit(1)
  })
