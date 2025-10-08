import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { adminAuth } from "../lib/firebase-admin"

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

async function cleanupDeletedUsers() {
  try {
    console.log("Starting cleanup of deleted users...")

    // Get all users from Firestore
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection)

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

    console.log(`\nFound ${usersToDelete.length} users to delete from Firestore`)

    if (usersToDelete.length === 0) {
      console.log("No cleanup needed!")
      return
    }

    // Delete users from Firestore
    for (const user of usersToDelete) {
      try {
        await deleteDoc(doc(db, "users", user.uid))
        console.log(`✓ Deleted ${user.email} from Firestore`)
      } catch (error) {
        console.error(`✗ Failed to delete ${user.email} from Firestore:`, error)
      }
    }

    console.log("\nCleanup completed!")
  } catch (error) {
    console.error("Error during cleanup:", error)
  }
}

// Run the cleanup
cleanupDeletedUsers()
