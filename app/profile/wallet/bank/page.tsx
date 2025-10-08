"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Plus, FileText, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface BankWallet {
  id: string
  holderName: string
  bankName: string
  accountNumber: string
  ifscCode: string
  createdAt: Date
  updatedAt: Date
}

export default function BankWalletPage() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<BankWallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const walletsRef = collection(db, "users", user.uid, "bankWallets")
    const q = query(walletsRef, orderBy("createdAt", "desc"))

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const walletsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as BankWallet[]

        setWallets(walletsData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching bank wallets:", error)
        setIsLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center">
            <Link href="/profile/wallet" className="text-gray-600">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-medium ml-4">Bank Wallet</h1>
          </div>
        </header>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-full animate-pulse">
                  <div className="h-6 w-6 bg-blue-200 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center">
          <Link href="/profile/wallet" className="text-gray-600">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-medium ml-4">Bank Wallet</h1>
        </div>
        <Link href="/profile/wallet/bank/add">
          <Button variant="ghost" size="icon" className="text-gray-600 border-2 border-black rounded-md">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      <div className="p-4 space-y-4">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{wallet.holderName}</h3>
                      <span className="text-sm text-gray-500">{wallet.bankName}</span>
                    </div>
                    <p className="text-sm text-gray-600">A/C: {wallet.accountNumber}</p>
                    <p className="text-sm text-gray-500">IFSC: {wallet.ifscCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <FileText className="h-12 w-12 mb-2" />
            <p>No bank wallets added yet</p>
          </div>
        )}
      </div>
    </main>
  )
}
