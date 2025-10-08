"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
  runTransaction,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BankWallet {
  id: string
  bankName: string
  accountName?: string // Make this field optional
  accountNumber: string
  ifscCode: string
}

export default function WithdrawPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankWallets, setBankWallets] = useState<BankWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<BankWallet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [withdrawalStatus, setWithdrawalStatus] = useState<string | null>(null)
  const [declineComment, setDeclineComment] = useState<string | null>(null)
  const [accountNameInput, setAccountNameInput] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Add this check for withdrawal status
    if (userProfile?.withdrawalStatus === "prohibited") {
      toast({
        title: "Access Denied",
        description: "Withdrawals are currently prohibited for your account. Please contact support.",
        variant: "destructive",
      })
      router.push("/profile")
      return
    }

    fetchBankWallets()
  }, [user, router, userProfile])

  useEffect(() => {
    if (!user) return

    const withdrawalsRef = collection(db, "withdrawals")
    const q = query(withdrawalsRef, where("userId", "==", user.uid), where("status", "in", ["approved", "rejected"]))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified" || change.type === "added") {
            const data = change.doc.data()
            setWithdrawalStatus(data.status)
            setDeclineComment(data.declineComment || null)

            // Show toast notification for rejected withdrawals
            if (data.status === "rejected") {
              toast({
                title: "Withdrawal Declined",
                description: data.declineComment
                  ? `Your withdrawal was declined: ${data.declineComment}`
                  : "Your withdrawal request was declined.",
                variant: "destructive",
              })
            } else if (data.status === "approved") {
              toast({
                title: "Withdrawal Approved",
                description: "Your withdrawal request has been approved.",
              })
            }
          }
        })
      },
      (error) => {
        console.error("Error fetching withdrawal status:", error)
        toast({
          title: "Error",
          description: "Failed to fetch withdrawal status",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [user])

  const fetchBankWallets = async () => {
    if (!user) return
    try {
      const walletsRef = collection(db, "users", user.uid, "bankWallets")
      const walletsSnapshot = await getDocs(walletsRef)
      const wallets = walletsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BankWallet[]
      setBankWallets(wallets)
    } catch (error) {
      console.error("Error fetching bank wallets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch bank wallets",
        variant: "destructive",
      })
    }
  }

  const handleSetMaxAmount = () => {
    if (userProfile?.realBalance) {
      setWithdrawAmount(userProfile.realBalance.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted. User:", user?.uid, "Selected Wallet:", selectedWallet?.id)
    if (!user || !selectedWallet) {
      console.error("User or selected wallet is missing")
      toast({
        title: "Error",
        description: "Please select a bank wallet",
        variant: "destructive",
      })
      return
    }

    if (!userProfile) {
      console.error("User profile is not loaded")
      toast({
        title: "Error",
        description: "Unable to load user profile. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const amount = Number(withdrawAmount)
      console.log("Withdrawal amount:", amount, "User balance:", userProfile.realBalance)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid withdrawal amount")
      }
      if (amount > userProfile.realBalance) {
        throw new Error("Insufficient balance")
      }

      const MIN_WITHDRAWAL_AMOUNT = 100 // INR
      if (amount < MIN_WITHDRAWAL_AMOUNT) {
        throw new Error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`)
      }

      if (!user.email) {
        throw new Error("User email is required for withdrawal")
      }

      const accountName = selectedWallet.accountName || accountNameInput || user.email || "Account Holder"

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await transaction.get(userRef)

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!")
        }

        const userData = userDoc.data()
        const newBalance = userData.realBalance - amount

        if (newBalance < 0) {
          throw new Error("Insufficient balance")
        }

        // Create withdrawal request
        const withdrawalData = {
          userId: user.uid,
          userEmail: user.email,
          amount: amount,
          bankDetails: {
            bankName: selectedWallet.bankName,
            accountName: accountName,
            accountNumber: selectedWallet.accountNumber,
            ifscCode: selectedWallet.ifscCode,
          },
          bankWalletId: selectedWallet.id, // Add this line to store the bank wallet ID
          status: "pending",
          createdAt: serverTimestamp(),
        }

        const withdrawalRef = await addDoc(collection(db, "withdrawals"), withdrawalData)

        // Update user's balance
        transaction.update(userRef, { realBalance: newBalance })

        console.log("Withdrawal request created with ID:", withdrawalRef.id)
      })

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      })

      // Redirect to the asset page
      router.push("/asset")
    } catch (error) {
      console.error("Error submitting withdrawal:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 select-none">
      <header className="flex items-center p-4 bg-white border-b">
        <Link href="/profile" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-medium">Withdraw</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <h2 className="text-base font-medium mb-2">Current available balance</h2>
          <div className="bg-white p-4 rounded-lg border">
            <span className="text-xl">{formatCurrency(userProfile?.realBalance || 0)}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-medium">Enter Withdraw Amount</h2>
            <Button
              type="button"
              size="sm"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-3 py-1 text-xs"
              onClick={handleSetMaxAmount}
            >
              All cash
            </Button>
          </div>
          <Input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="bg-white"
            placeholder="0"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-medium">Select bank wallet</h2>
            <Button
              type="button"
              size="sm"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md px-3 py-1 text-xs"
              onClick={() => router.push("/profile/wallet")}
            >
              My wallet
            </Button>
          </div>
          <div className="space-y-2">
            {bankWallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-4 rounded-lg border cursor-pointer ${
                  selectedWallet?.id === wallet.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedWallet(wallet)}
              >
                <p className="font-medium">{wallet.bankName}</p>
                {wallet.accountName && <p className="text-sm text-gray-600">Account: {wallet.accountName}</p>}
                <p className="text-sm text-gray-600">A/C: {wallet.accountNumber}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedWallet && !selectedWallet.accountName && (
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountNameInput}
              onChange={(e) => setAccountNameInput(e.target.value)}
              placeholder="Enter account name"
              required
            />
          </div>
        )}

        <Button
          type="submit"
          className={`w-full text-white ${
            isLoading || withdrawalStatus === "pending"
              ? "bg-gray-400 cursor-not-allowed"
              : "gradient-button hover:opacity-90"
          }`}
          disabled={
            isLoading ||
            withdrawalStatus === "pending" ||
            !selectedWallet ||
            !withdrawAmount ||
            (selectedWallet && !selectedWallet.accountName && !accountNameInput)
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </span>
          ) : withdrawalStatus === "pending" ? (
            "Withdrawal Pending"
          ) : (
            "Submit Withdrawal"
          )}
        </Button>
      </form>
    </main>
  )
}
