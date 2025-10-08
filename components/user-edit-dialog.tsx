"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { UserProfile } from "@/lib/types"

interface UserEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
  onSave: () => void
}

export function UserEditDialog({ open, onOpenChange, user, onSave }: UserEditDialogProps) {
  const [formData, setFormData] = useState({
    realBalance: 0,
    frozenAmount: 0,
    creditScore: 100,
    status: "active",
    withdrawalStatus: "allowed",
    ban: "none",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      console.log("Loading user data into form:", user) // Debug log
      setFormData({
        realBalance: user.realBalance || 0,
        frozenAmount: user.frozenAmount || 0,
        creditScore: user.creditScore || 100,
        status: user.status || "active",
        withdrawalStatus: user.withdrawalStatus || "allowed",
        ban: user.ban || "none",
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const userRef = doc(db, "users", user.uid)
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      }

      console.log("Updating user with data:", updateData) // Debug log

      await updateDoc(userRef, updateData)

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User: {user?.email}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="realBalance">Real Balance (₹)</Label>
              <Input
                id="realBalance"
                type="number"
                step="0.01"
                value={formData.realBalance}
                onChange={(e) => handleInputChange("realBalance", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frozenAmount">Frozen Amount (₹)</Label>
              <Input
                id="frozenAmount"
                type="number"
                step="0.01"
                value={formData.frozenAmount}
                onChange={(e) => handleInputChange("frozenAmount", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditScore">Credit Score</Label>
            <Input
              id="creditScore"
              type="number"
              min="0"
              max="1000"
              value={formData.creditScore}
              onChange={(e) => handleInputChange("creditScore", Number.parseInt(e.target.value) || 100)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalStatus">Withdrawal Status</Label>
              <Select
                value={formData.withdrawalStatus}
                onValueChange={(value) => handleInputChange("withdrawalStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="prohibited">Prohibited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ban">Ban Status</Label>
            <Select value={formData.ban} onValueChange={(value) => handleInputChange("ban", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
