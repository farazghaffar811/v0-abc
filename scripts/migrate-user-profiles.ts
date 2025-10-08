import { db } from "../lib/firebase"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import type { UserProfile } from "../lib/types"

const defaultUserProfile: Partial<UserProfile> = {
  balance: 0,
  referralCount: 0,
  frozenAmount: 0,
  creditScore: 0,
  status: "active",
  banStatus: "none",
}

async function migrateUserProfiles() {
  const usersRef = collection(db, "users")
  const snapshot = await getDocs(usersRef)

  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data() as Partial<UserProfile>
    const updates: Partial<UserProfile> = {}

    for (const [key, value] of Object.entries(defaultUserProfile)) {
      if (userData[key as keyof UserProfile] === undefined) {
        updates[key as keyof UserProfile] = value
      }
    }

    if (Object.keys(updates).length > 0) {
      console.log(`Updating user ${userDoc.id} with:`, updates)
      await updateDoc(doc(db, "users", userDoc.id), updates)
    }
  }

  console.log("User profile migration completed")
}

migrateUserProfiles().catch(console.error)
