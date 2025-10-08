import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDb7BXuFRair_C-5C2VVRvqOhSqzwbw3O8",
  authDomain: "coin-db15b.firebaseapp.com",
  databaseURL: "https://coin-db15b-default-rtdb.firebaseio.com",
  projectId: "coin-db15b",
  storageBucket: "coin-db15b.firebasestorage.app",
  messagingSenderId: "782800068244",
  appId: "1:782800068244:web:57bfbbacee820e8c501e81",
  measurementId: "G-YTDW6606JW",
}

// Initialize Firebase
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics only in browser environment
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app
