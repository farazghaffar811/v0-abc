import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

let adminApp
let adminDb
let adminAuth

try {
  if (!getApps().length) {
    // Parse the service account key from environment variable
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
    }

    let serviceAccount
    try {
      // Try to parse as JSON string
      serviceAccount = JSON.parse(serviceAccountKey)
    } catch (parseError) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON:", parseError)
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format")
    }

    // Ensure private key has proper line breaks
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")
    }

    adminApp = initializeApp(
      {
        credential: cert(serviceAccount),
        projectId: "coin-db15b",
      },
      "admin",
    )
  } else {
    adminApp = getApps().find((app) => app.name === "admin") || getApps()[0]
  }

  adminDb = getFirestore(adminApp)
  adminAuth = getAuth(adminApp)

  console.log("Firebase Admin SDK initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error)
  throw new Error("Failed to initialize Firebase Admin SDK")
}

export { adminDb, adminAuth }
export default adminApp
