"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserProfile {
  realBalance?: number
  frozenAmount?: number
  email?: string
}

export default function RechargePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as UserProfile
          setUserProfile(userData)
        }
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching user profile:", error)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  const rechargeAmounts = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-white">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Recharge</h1>
        </div>

        {/* Balance Card */}
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Current Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(userProfile.realBalance || 0)}
              </div>
              <div className="text-sm text-gray-600">Frozen: {formatCurrency(userProfile.frozenAmount || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Message */}
        <div className="px-4 mb-4">
          <Alert>
            <AlertDescription className="text-center">
              <strong>Important:</strong> To recharge your account, please contact your teacher or administrator.
              <br />
              <br />
              <strong>Contact Information:</strong>
              <br />
              Email: admin@digiloom.com
              <br />
              Phone: +91 9876543210
            </AlertDescription>
          </Alert>
        </div>

        {/* Recharge Amount Options */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Select Amount</h2>
          <div className="grid grid-cols-2 gap-4">
            {rechargeAmounts.map((amount) => (
              <Card key={amount} className="cursor-not-allowed opacity-60">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-gray-500">{formatCurrency(amount)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Disabled Recharge Button */}
        <div className="p-4">
          <Button disabled className="w-full h-12 text-lg bg-gray-300 text-gray-600 cursor-not-allowed">
            Recharge Unavailable - Contact Teacher
          </Button>
        </div>
      </div>
    </div>
  )
}
