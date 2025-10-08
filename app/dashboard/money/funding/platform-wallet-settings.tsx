"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function PlatformWalletSettings() {
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchWalletAddress = async () => {
      setIsLoading(true)
      const docRef = doc(db, "settings", "platformWallet")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setWalletAddress(docSnap.data().address || "")
      } else {
        console.log("No platform wallet document found")
      }
      setIsLoading(false)
    }
    fetchWalletAddress()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await setDoc(doc(db, "settings", "platformWallet"), { address: walletAddress }, { merge: true })
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error updating wallet address:", error)
      toast({
        title: "Error",
        description: "Failed to update platform wallet address.",
        variant: "destructive",
      })
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Platform Wallet Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
            Wallet Address (TRC20)
          </label>
          <Input
            type="text"
            id="walletAddress"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter TRC20 wallet address"
            className="mt-1"
          />
        </div>
        <Button type="submit">Update Wallet Address</Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>The platform wallet address has been updated successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
