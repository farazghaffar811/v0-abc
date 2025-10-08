"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase" // Import auth directly from firebase.ts

export default function UpdateAdminPassword() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdatePassword = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

      if (!adminEmail) {
        throw new Error("Admin email not configured")
      }

      // Sign in with the current password using the pre-initialized auth instance
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, "adminPassword123!")

      const uid = userCredential.user.uid

      // Call the reset-password API to update the password
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          newPassword: "Admin@Password!",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password")
      }

      setIsComplete(true)
      toast({
        title: "Success",
        description: "Admin password has been updated to 'Admin@Password!'",
      })
    } catch (err) {
      console.error("Error updating admin password:", err)
      setError(err instanceof Error ? err.message : "Failed to update admin password")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update admin password",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">Update Admin Password</h1>

      {isComplete ? (
        <div className="text-green-600 mb-4">Password successfully updated to 'Admin@Password!'</div>
      ) : (
        <>
          <p className="mb-4">This will update the admin password from 'adminPassword123!' to 'Admin@Password!'</p>

          {error && <div className="text-red-600 mb-4">Error: {error}</div>}

          <Button onClick={handleUpdatePassword} disabled={isUpdating} className="w-full">
            {isUpdating ? "Updating..." : "Update Admin Password"}
          </Button>
        </>
      )}
    </div>
  )
}
