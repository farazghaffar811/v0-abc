"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { createBankWallet } from "@/lib/firebase-wallet"

export default function AddBankWalletPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    routingNumber: "",
    accountNumber: "",
    bankName: "",
    bankBranch: "",
    bankDistrict: "",
  })

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a wallet",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.routingNumber || !formData.accountNumber || !formData.bankName || !formData.bankBranch || !formData.bankDistrict) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createBankWallet(user.uid, formData)

      toast({
        title: "Success",
        description: "Bank wallet added successfully",
      })

      router.push("/profile/wallet/bank")
    } catch (error) {
      console.error("Error saving bank wallet:", error)
      toast({
        title: "Error",
        description: "Failed to save bank wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center p-4 bg-white border-b">
        <Link href="/profile/wallet/bank" className="text-gray-600">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-medium ml-4">Add Bank Wallet</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            placeholder="Please enter your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Routing Number</Label>
          <Input
            placeholder="Please enter routing number"
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            placeholder="Please enter account number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input
            placeholder="Please enter bank name"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Bank Branch</Label>
          <Input
            placeholder="Please enter bank branch"
            value={formData.bankBranch}
            onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Bank District</Label>
          <Input
            placeholder="Please enter bank district"
            value={formData.bankDistrict}
            onChange={(e) => setFormData({ ...formData, bankDistrict: e.target.value })}
            className="bg-white"
          />
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </main>
  )
}
