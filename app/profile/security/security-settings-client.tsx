"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SecuritySettingsClient() {
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Show toast message instead of processing the form
    toast({
      title: "Password Change Restricted",
      description: "For password changes, kindly contact with your teacher.",
      variant: "destructive",
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Security Settings</h2>

      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="text-amber-600 font-medium">
          Password changes are restricted. Please contact your teacher for assistance.
        </AlertDescription>
      </Alert>

      {error && <div className="text-red-500">{error}</div>}
      {successMessage && <div className="text-green-500">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            type="password"
            id="currentPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={true}
            className="bg-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={true}
            className="bg-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={true}
            className="bg-gray-100"
          />
        </div>
        <Button type="submit" className="bg-gray-400 hover:bg-gray-500">
          Contact Teacher for Password Change
        </Button>
      </form>
    </div>
  )
}
