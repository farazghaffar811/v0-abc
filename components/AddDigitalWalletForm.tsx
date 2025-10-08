"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createDigitalWallet } from "@/lib/firebase-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const AddDigitalWalletForm: React.FC = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    currency: "",
    currencySymbol: "",
    classification: "",
    address: "",
    comment: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a wallet",
        variant: "destructive",
      })
      return
    }

    try {
      await createDigitalWallet(user.uid, formData)
      toast({
        title: "Success",
        description: "Digital wallet added successfully",
      })
      // Reset form
      setFormData({
        currency: "",
        currencySymbol: "",
        classification: "",
        address: "",
        comment: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add digital wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        onValueChange={(value) => setFormData({ ...formData, currency: value, currencySymbol: value })}
        value={formData.currency}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
          <SelectItem value="USDT">Tether (USDT)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => setFormData({ ...formData, classification: value })}
        value={formData.classification}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select classification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="savings">Savings</SelectItem>
          <SelectItem value="trading">Trading</SelectItem>
          <SelectItem value="investment">Investment</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Wallet Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <Input
        placeholder="Comment (optional)"
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
      />

      <Button type="submit">Add Digital Wallet</Button>
    </form>
  )
}

export default AddDigitalWalletForm
