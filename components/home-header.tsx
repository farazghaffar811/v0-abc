"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatCurrency } from "@/lib/utils"
import { Bell, User } from "lucide-react"
import Link from "next/link"

interface UserBalance {
  realBalance?: number
  balance?: number
}

export function HomeHeader() {
  const { user } = useAuth()
  const [userBalance, setUserBalance] = useState<UserBalance>({})

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as UserBalance
          setUserBalance(userData)
        }
      },
      (error) => {
        console.error("Error fetching user balance:", error)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Supercoin</h1>
            <p className="text-sm text-gray-600">
              Balance: {formatCurrency(userBalance.realBalance || userBalance.balance || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
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
