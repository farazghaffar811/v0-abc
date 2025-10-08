"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export function FirestoreTest() {
  const [testResult, setTestResult] = useState<string>("Waiting for authentication...")
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      testFirestore()
    } else {
      setTestResult("User not authenticated. Please log in to test Firestore.")
    }
  }, [user])

  async function testFirestore() {
    try {
      console.log("Starting Firestore test...")
      console.log("Current user:", user?.uid)
      const querySnapshot = await getDocs(collection(db, "users"))
      console.log("Firestore query snapshot:", querySnapshot)
      setTestResult(`Firestore read successful. Document count: ${querySnapshot.size}`)
      setError(null)
    } catch (error) {
      console.error("Firestore test error:", error)
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              code: (error as any).code,
              stack: error.stack,
            }
          : error
      setError(JSON.stringify(errorDetails, null, 2))
      setTestResult("Firestore read failed. Check error details below.")
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-md mt-4">
      <h2 className="text-lg font-semibold mb-2">Firestore Test</h2>
      <p className="mb-2">{testResult}</p>
      {error && (
        <div className="mt-2 text-red-600">
          <p className="font-semibold">Error details:</p>
          <pre className="text-sm overflow-auto whitespace-pre-wrap bg-red-50 p-2 rounded mt-1">{error}</pre>
        </div>
      )}
      <p className="mt-2">User ID: {user?.uid || "Not logged in"}</p>
    </div>
  )
}
