"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { createDigitalWallet } from "@/lib/firebase-wallet"

// Supported cryptocurrencies with their details
const SUPPORTED_CURRENCIES = [
  { symbol: "USDT", name: "Tether", network: "TRC20" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum", network: "ERC20" },
  { symbol: "DOGE", name: "Dogecoin", network: "Dogecoin" },
  { symbol: "BNB", name: "Binance Coin", network: "BEP20" },
  { symbol: "TRX", name: "TRON", network: "TRC20" },
]

const CLASSIFICATIONS = [
  { value: "savings", label: "Savings" },
  { value: "trading", label: "Trading" },
  { value: "investment", label: "Investment" },
  { value: "business", label: "Business" },
]

export default function AddDigitalWalletPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false)
  const [isClassificationDialogOpen, setIsClassificationDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    currency: "",
    currencySymbol: "",
    classification: "",
    address: "",
    comment: "",
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

    if (!formData.currency || !formData.classification || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createDigitalWallet(user.uid, {
        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        classification: formData.classification,
        address: formData.address,
        comment: formData.comment,
      })

      toast({
        title: "Success",
        description: "Digital wallet added successfully",
      })

      router.push("/profile/wallet/digital")
    } catch (error) {
      console.error("Error saving digital wallet:", error)
      toast({
        title: "Error",
        description: "Failed to save digital wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center p-4 bg-white border-b">
        <Link href="/profile/wallet/digital" className="text-gray-600">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-medium ml-4">Add Digital Wallet</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Currency Selection */}
        <div className="space-y-2">
          <Label>Currency</Label>
          <div
            className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer"
            onClick={() => setIsCurrencyDialogOpen(true)}
          >
            <span className="text-gray-600">{formData.currency || "Please select currency"}</span>
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </div>
        </div>

        {/* Classification Selection */}
        <div className="space-y-2">
          <Label>Classification</Label>
          <div
            className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer"
            onClick={() => setIsClassificationDialogOpen(true)}
          >
            <span className="text-gray-600">{formData.classification || "Please select classification"}</span>
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </div>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            placeholder="Please enter wallet address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="bg-white"
          />
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label>Comment</Label>
          <Textarea
            placeholder="Please enter comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="min-h-[100px] bg-white"
          />
        </div>

        <Button className="w-full gradient-button text-white py-6" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Currency Selection Dialog */}
      <Dialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen}>
        <DialogContent className="p-0 gap-0">
          <div className="flex items-center justify-between p-4 border-b">
            <button className="text-blue-600" onClick={() => setIsCurrencyDialogOpen(false)}>
              Cancel
            </button>
            <span className="font-medium">Select digital currency</span>
            <button className="text-blue-600" onClick={() => setIsCurrencyDialogOpen(false)}>
              OK
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <div
                key={currency.symbol}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  formData.currencySymbol === currency.symbol ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    currency: `${currency.name} (${currency.network})`,
                    currencySymbol: currency.symbol,
                  })
                  setIsCurrencyDialogOpen(false)
                }}
              >
                {currency.name} ({currency.network})
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Classification Selection Dialog */}
      <Dialog open={isClassificationDialogOpen} onOpenChange={setIsClassificationDialogOpen}>
        <DialogContent className="p-0 gap-0">
          <div className="flex items-center justify-between p-4 border-b">
            <button className="text-blue-600" onClick={() => setIsClassificationDialogOpen(false)}>
              Cancel
            </button>
            <span className="font-medium">Select classification</span>
            <button className="text-blue-600" onClick={() => setIsClassificationDialogOpen(false)}>
              OK
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {CLASSIFICATIONS.map((classification) => (
              <div
                key={classification.value}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  formData.classification === classification.label ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    classification: classification.label,
                  })
                  setIsClassificationDialogOpen(false)
                }}
              >
                {classification.label}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
