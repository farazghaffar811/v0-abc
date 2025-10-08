import { db } from "../lib/firebase"
import { collection, getDocs, doc, writeBatch } from "firebase/firestore"
import type { UserProfile } from "../lib/types"

const defaultUserProfile: Partial<UserProfile> = {
  balance: 0,
  referralCount: 0,
  frozenAmount: 0,
  creditScore: 0,
  status: "active",
  banStatus: "none",
  notificationPreferences: {
    email: true,
    push: false,
  },
  kycStatus: "not_started",
  twoFactorEnabled: false,
}

async function updateUserProfiles() {
  const usersRef = collection(db, "users")
  const snapshot = await getDocs(usersRef)
  const batch = writeBatch(db)

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
      batch.update(doc(db, "users", userDoc.id), updates)
    }
  }

  await batch.commit()
  console.log("User profile updates committed to Firestore")
}

updateUserProfiles().catch(console.error)
