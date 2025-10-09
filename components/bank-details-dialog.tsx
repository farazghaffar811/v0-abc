"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, CreditCard, Hash, User } from "lucide-react"
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

interface BankDetails {
  accountHolderName: string
  accountNumber: string
  bankName: string
  ifscCode: string
}

interface BankDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userEmail: string
  withdrawalBankDetails?: any
  withdrawalId?: string
}

export function BankDetailsDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
  withdrawalBankDetails,
  withdrawalId,
}: BankDetailsDialogProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && withdrawalBankDetails) {
      // Pre-fill fields from the withdrawal doc, handling multiple key variants
      setBankDetails({
        accountHolderName: withdrawalBankDetails.accountName || withdrawalBankDetails.accountHolderName || "",
        accountNumber: withdrawalBankDetails.accountNumber || "",
        bankName: withdrawalBankDetails.bankName || "",
        ifscCode: withdrawalBankDetails.ifscCode || withdrawalBankDetails.ifsc || "",
      })
    } else if (open) {
      setBankDetails({
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
      })
    }
  }, [open, withdrawalBankDetails])

  const hasBankDetails =
    bankDetails.accountHolderName || bankDetails.accountNumber || bankDetails.bankName || bankDetails.ifscCode

  async function syncUserBankWallets(userId: string, holderName: string) {
    // Map to the fields the user app expects in users/{uid}/bankWallets
    const walletPayload = {
      holderName: holderName,
      bankName: bankDetails.bankName || "",
      accountNumber: bankDetails.accountNumber || "",
      ifscCode: (bankDetails.ifscCode || "").toUpperCase(),
      updatedAt: serverTimestamp(),
      updatedByAdmin: true,
    }

    const walletsCol = collection(db, "users", userId, "bankWallets")
    const qLatest = query(walletsCol, orderBy("createdAt", "desc"), limit(1))
    const snap = await getDocs(qLatest)

    if (!snap.empty) {
      // Update the most recent wallet doc
      const ref = snap.docs[0].ref
      await updateDoc(ref, walletPayload)
    } else {
      // Create a new primary wallet doc if none exists yet
      await addDoc(walletsCol, {
        ...walletPayload,
        createdAt: serverTimestamp(),
        primary: true,
        source: "admin",
      })
    }
  }

  async function handleUpdate() {
    if (!userId) return
    try {
      setIsLoading(true)

      // Build normalized payload: write both accountName and accountHolderName for compatibility
      const holderName = bankDetails.accountHolderName || withdrawalBankDetails?.accountName || ""
      const normalized = {
        accountName: holderName,
        accountHolderName: holderName,
        accountNumber: bankDetails.accountNumber || "",
        bankName: bankDetails.bankName || "",
        ifscCode: (bankDetails.ifscCode || "").toUpperCase(),
      }

      // Upsert into users/{userId}
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          bankDetails: normalized,
          updatedAt: serverTimestamp(),
        })
      } else {
        await setDoc(
          userRef,
          {
            bankDetails: normalized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      }

      // Keep the user app in sync: update or create latest users/{uid}/bankWallets doc
      await syncUserBankWallets(userId, holderName)

      // Optionally mirror on the withdrawal doc if present
      if (withdrawalId) {
        const collectionNames = ["withdrawals", "withdrawalRequests", "withdrawal_requests", "withdrawalRequest"]
        for (const name of collectionNames) {
          try {
            const wRef = doc(db, name, withdrawalId)
            await updateDoc(wRef, {
              bankDetails: normalized,
              updatedAt: serverTimestamp(),
            })
            break
          } catch {
            // try next collection name
          }
        }
      }

      toast({
        title: "Success",
        description: "Bank details updated and synced to the user app",
      })
    } catch (error: any) {
      console.error("Error updating bank details:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update bank details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bank Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">User ID:</span>
                  <span className="text-sm text-gray-600">{userId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-gray-600">{userEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Bank Details Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bank Details Status:</span>
            <Badge variant={hasBankDetails ? "default" : "destructive"}>
              {hasBankDetails ? "Available" : "Not Set"}
            </Badge>
          </div>

          {/* Bank Details Form */}
          {hasBankDetails ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Holder Name
                </Label>
                <Input
                  id="accountHolderName"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Enter account holder name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Enter account number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Enter bank name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  IFSC Code
                </Label>
                <Input
                  id="ifscCode"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, ifscCode: e.target.value }))}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">No bank details found for this user.</p>
                <p className="text-xs text-gray-400">The user needs to add their bank details in their profile.</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {hasBankDetails && (
              <Button onClick={handleUpdate} disabled={isLoading || !userId}>
                {isLoading ? "Updating..." : "Update Details"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
