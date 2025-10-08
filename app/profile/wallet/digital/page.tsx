"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Plus, FileText, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

interface DigitalWallet {
  id: string
  currency: string
  currencySymbol: string
  classification: string
  address: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

const deleteDigitalWallet = async (userId: string, walletId: string) => {
  const walletRef = doc(db, "users", userId, "digitalWallets", walletId)
  await deleteDoc(walletRef)
}

export default function DigitalWalletPage() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<DigitalWallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const walletsRef = collection(db, "users", user.uid, "digitalWallets")
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
        })) as DigitalWallet[]

        setWallets(walletsData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching digital wallets:", error)
        setIsLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user])

  const handleDeleteWallet = async (walletId: string) => {
    if (!user) return

    try {
      await deleteDigitalWallet(user.uid, walletId)
      toast({
        title: "Success",
        description: "Digital wallet deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete digital wallet",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center">
            <Link href="/profile/wallet" className="text-gray-600">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-medium ml-4">Digital Wallet</h1>
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
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-lg font-medium ml-4">Digital Wallet</h1>
        </div>
        <Link href="/profile/wallet/digital/add">
          <Button variant="ghost" size="icon" className="text-gray-600 border-2 border-black rounded-md">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      <div className="p-4 space-y-4">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="p-4 flex justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{wallet.currency}</h3>
                      <span className="text-sm text-gray-500">{wallet.classification}</span>
                    </div>
                    <p className="text-sm text-gray-600 break-all">{wallet.address}</p>
                    {wallet.comment && <p className="text-sm text-gray-500">{wallet.comment}</p>}
                  </div>
                </div>
                <Button onClick={() => handleDeleteWallet(wallet.id)} variant="destructive" size="icon">
                  X
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <FileText className="h-12 w-12 mb-2" />
            <p>No digital wallets added yet</p>
          </div>
        )}
      </div>
    </main>
  )
}
