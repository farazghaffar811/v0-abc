"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatCurrency } from "@/lib/currency"
import type { Currency } from "@/lib/currency"
import { Bell, User } from "lucide-react"
import Link from "next/link"

interface UserBalance {
  realBalance?: number
  balance?: number
  frozenAmount?: number
  creditScore?: number
  status?: string
  isFrozen?: boolean
  ban?: string
  withdrawalStatus?: string
  withdrawalProhibited?: boolean
  currency?: Currency
}

export function HomeHeader() {
  const { user } = useAuth()
  const [userBalance, setUserBalance] = useState<UserBalance>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    setIsLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as UserBalance
          setUserBalance(userData)
        }
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching user balance:", error)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  const displayBalance = isLoading ? "Loading..." : formatCurrency(userBalance.realBalance || userBalance.balance || 0, userBalance.currency || "INR")
  const displayFrozen = isLoading ? "0" : formatCurrency(userBalance.frozenAmount || 0, userBalance.currency || "INR")

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900">Coinbase</h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 truncate">
                Available: <span className="font-semibold text-green-600">{displayBalance}</span>
              </p>
              {userBalance.frozenAmount ? (
                <p className="text-sm text-gray-600 truncate">
                  Frozen: <span className="font-semibold text-red-600">{displayFrozen}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </button>
          <Link href="/profile" className="p-2 text-gray-600 hover:text-gray-900">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default HomeHeader
