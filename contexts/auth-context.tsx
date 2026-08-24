"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
  getFirestore,
  connectFirestoreEmulator,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateReferralCode } from "@/lib/utils"
import type { UserProfile } from "@/lib/types"
import type { Currency } from "@/lib/currency"
import { DEFAULT_CURRENCY } from "@/lib/currency"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, referralCode?: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
  isAdmin: boolean
  currency: Currency
  setCurrency: (currency: Currency) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAIL = "admin@supercoin.com"
const REFERRAL_BONUS = 5 // USDT bonus amount
const INITIAL_CREDIT_SCORE = 100
const INITIAL_REPUTATION = 100

const handleFirebaseError = (error: any): string => {
  console.error("Firebase error:", error)
  if (error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password") {
    return "Invalid email or password. Please try again."
  }
  return error?.message || "An unexpected error occurred. Please try again."
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function retryOperation(operation: () => Promise<any>) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error)
      if (attempt === MAX_RETRIES) throw error
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    }
  }
}

try {
  const firestore = getFirestore()
  // Check if we're running in development mode
  if (process.env.NODE_ENV === "development") {
    // Connect to the local Firestore emulator
    connectFirestoreEmulator(firestore, "localhost", 8080)
  }
} catch (error) {
  console.error("Error initializing Firestore:", error)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("AuthProvider is rendering")

  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user ? user.uid : "null")
      setUser(user)
      setIsLoading(true)
      if (user) {
        try {
          await retryOperation(async () => {
            const userDocRef = doc(db, "users", user.uid)
            const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
              if (doc.exists()) {
                const userData = doc.data() as UserProfile

                // Ensure credit score and reputation have default values
                if (!userData.creditScore || userData.creditScore === null || isNaN(userData.creditScore)) {
                  userData.creditScore = INITIAL_CREDIT_SCORE
                }
                if (!userData.reputation || userData.reputation === null || isNaN(userData.reputation)) {
                  userData.reputation = INITIAL_REPUTATION
                }

                console.log("User profile loaded:", userData)
                const selectedCurrency = userData.currency || DEFAULT_CURRENCY
                setCurrencyState(selectedCurrency)
                setUserProfile({ ...userData, currency: selectedCurrency })
                const isAdminUser = userData.email === ADMIN_EMAIL
                setIsAdmin(isAdminUser)
                document.cookie = `isAdmin=${isAdminUser}; path=/; max-age=86400; secure; samesite=strict`
              } else {
                console.log("No user document found! Creating one now.")
                const newUserProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email || "",
                  referralCode: generateReferralCode(),
                  balance: 0,
                  realBalance: 0,
                  currency: DEFAULT_CURRENCY,
                  frozenAmount: 0,
                  creditScore: INITIAL_CREDIT_SCORE,
                  reputation: INITIAL_REPUTATION,
                  referralCount: 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  status: "active",
                  ban: "none",
                  isFrozen: false,
                  withdrawalProhibited: false,
                  withdrawalStatus: "allowed",
                  phone: "",
                  direction: "actual",
                }
                setDoc(userDocRef, newUserProfile)
                setUserProfile(newUserProfile)
                setIsAdmin(user.email === ADMIN_EMAIL)
              }
              setIsLoading(false)
            })

            return () => unsubscribeSnapshot()
          })
        } catch (error) {
          console.error("Error fetching or creating user profile:", error)
          setError("Failed to fetch or create user profile. Please try again later.")
          setIsAdmin(false)
          setIsLoading(false)
        }
      } else {
        console.log("No user logged in, resetting state")
        setUserProfile(null)
        setIsAdmin(false)
        document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const setCurrency = async (nextCurrency: Currency) => {
    setCurrencyState(nextCurrency)
    setUserProfile((current) => current ? { ...current, currency: nextCurrency } : current)
    if (user?.uid) await setDoc(doc(db, "users", user.uid), { currency: nextCurrency, updatedAt: serverTimestamp() }, { merge: true })
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Attempting to sign in with email and password")
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login successful, user:", userCredential.user.uid)

      const isAdminUser = email === ADMIN_EMAIL
      setIsAdmin(isAdminUser)

      // Set cookies
      document.cookie = `auth=true; path=/; max-age=86400; secure; samesite=strict`
      document.cookie = `isAdmin=${isAdminUser}; path=/; max-age=86400; secure; samesite=strict`

      // Fetch user profile and update state
      const userDocRef = doc(db, "users", userCredential.user.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile

        // Ensure credit score and reputation have default values
        if (!userData.creditScore || userData.creditScore === null || isNaN(userData.creditScore)) {
          userData.creditScore = INITIAL_CREDIT_SCORE
        }
        if (!userData.reputation || userData.reputation === null || isNaN(userData.reputation)) {
          userData.reputation = INITIAL_REPUTATION
        }

        console.log("User profile loaded:", userData)
        setUserProfile(userData)
      } else {
        console.log("No user document found. This should not happen for existing users.")
      }

      // Redirect based on user type
      if (isAdminUser) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      setError(handleFirebaseError(error))
      return { success: false, error: handleFirebaseError(error) }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Starting user registration process")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("User created in Firebase Auth:", userCredential.user.uid)
      const uid = userCredential.user.uid
      const newReferralCode = generateReferralCode()

      const userProfile: UserProfile = {
        uid,
        email,
        referralCode: newReferralCode,
        balance: 0,
        realBalance: 0,
        referralCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        referredBy: referralCode,
        frozenAmount: 0,
        creditScore: INITIAL_CREDIT_SCORE,
        reputation: INITIAL_REPUTATION,
        status: "active",
        ban: "none",
        isFrozen: false,
        withdrawalProhibited: false,
        withdrawalStatus: "allowed",
        phone: "",
        direction: "actual",
      }

      console.log("Attempting to create user document in Firestore")
      await setDoc(doc(db, "users", uid), userProfile)
      console.log("User document created successfully in Firestore")

      setUserProfile(userProfile)
      document.cookie = "auth=true; path=/; max-age=86400; secure; samesite=strict"
      router.push("/")
    } catch (error) {
      console.error("Registration error:", error)
      setError(handleFirebaseError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const initializeUserSubcollections = async (uid: string) => {
    try {
      // Initialize 'transactions' subcollection
      await setDoc(doc(db, "users", uid, "transactions", "initial"), {
        type: "system",
        amount: 0,
        description: "Account created",
        timestamp: serverTimestamp(),
      })

      // Initialize 'notifications' subcollection
      await setDoc(doc(db, "users", uid, "notifications", "welcome"), {
        type: "welcome",
        message: "Welcome to our platform!",
        read: false,
        timestamp: serverTimestamp(),
      })

      console.log("User subcollections initialized successfully")
    } catch (error) {
      console.error("Error initializing user subcollections:", error)
      // Consider how to handle this error - maybe add it to a queue for retry?
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signOut(auth)
      setUserProfile(null)
      setIsAdmin(false)
      // Remove the auth and isAdmin cookies
      document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setError(handleFirebaseError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        login,
        register,
        logout,
        isLoading,
        error,
  isAdmin,
  currency,
  setCurrency,
  }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
