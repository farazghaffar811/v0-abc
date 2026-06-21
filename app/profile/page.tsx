"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type React from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { ProfileMenu } from "@/components/profile-menu"
import Link from "next/link"
import { createDepositRequest } from "@/lib/deposit"
import type { UserProfile } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatCurrency, capitalizeWords } from "@/lib/utils"

export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth()
  const [depositAmount, setDepositAmount] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      console.log("Setting up real-time listener for user:", user.uid)
      const userRef = doc(db, "users", user.uid)
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          console.log("Document snapshot received")
          if (doc.exists()) {
            const userData = doc.data() as UserProfile
            console.log("Raw user data from Firestore:", userData)

            // Ensure credit score has a default value if it's null/undefined
            if (!userData.creditScore || userData.creditScore === null || isNaN(userData.creditScore)) {
              userData.creditScore = 100
            }

            // Ensure reputation has a default value if it's null/undefined
            if (!userData.reputation || userData.reputation === null || isNaN(userData.reputation)) {
              userData.reputation = 100
            }

            // Log the processed data
            console.log("Processed user data:", {
              realBalance: userData.realBalance,
              frozenAmount: userData.frozenAmount,
              creditScore: userData.creditScore,
              status: userData.status,
              withdrawalStatus: userData.withdrawalStatus,
              withdrawalProhibited: userData.withdrawalProhibited,
              isFrozen: userData.isFrozen,
              ban: userData.ban,
            })

            setUserProfile(userData)
            setIsLoading(false)
          } else {
            console.error("User document does not exist")
            setIsLoading(false)
          }
        },
        (error) => {
          console.error("Error fetching user profile:", error)
          setIsLoading(false)
        },
      )

      return () => {
        console.log("Cleaning up real-time listener")
        unsubscribe()
      }
    }
  }, [user])

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && depositAmount) {
      try {
        await createDepositRequest(user.uid, user.email || "", Number.parseFloat(depositAmount))
        toast({
          title: "Success",
          description: "Deposit request submitted successfully!",
        })
        setDepositAmount("")
      } catch (error) {
        console.error("Error submitting deposit request:", error)
        toast({
          title: "Error",
          description: "Failed to submit deposit request. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Function to extract username from email
  const getDisplayName = (email: string) => {
    return email.split("@")[0]
  }

  // Default avatar URL
  const defaultAvatar = "https://res.cloudinary.com/dwnt025iw/image/upload/v1758720367/avatar.f708a1f_xhaxdx.svg"

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!userProfile) {
    return <div>Error loading profile. Please try again later.</div>
  }

  // Ensure we have valid credit score for display
  const displayCreditScore = userProfile.creditScore && !isNaN(userProfile.creditScore) ? userProfile.creditScore : 100

  // Determine account status based on multiple fields
  const getAccountStatus = () => {
    if (userProfile.ban === "permanent" || userProfile.ban === "temporary") {
      return "banned"
    }
    if (userProfile.isFrozen || userProfile.status === "frozen") {
      return "frozen"
    }
    if (userProfile.status === "suspended") {
      return "suspended"
    }
    return userProfile.status || "active"
  }

  const accountStatus = getAccountStatus()

  return (
    <main className="min-h-screen pb-20 select-none">
      <div className="p-4 bg-white text-black">
        <div className="flex items-start gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-black">
            <img src={userProfile.avatar || defaultAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">UserName: {getDisplayName(userProfile.email)}</h2>
              <button className="text-sm">Copy</button>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="text-black">
            <Eye className="h-5 w-5" />
          </Button>
        </div>

        {/* Single Balance and Status Card */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Balance:</span>
                <span className="font-semibold text-lg text-green-600">
                  {formatCurrency(userProfile.realBalance || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frozen Amount:</span>
                <span className="font-semibold text-lg text-red-600">
                  {formatCurrency(userProfile.frozenAmount || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Credit Score:</span>
                <span
                  className={`font-semibold text-lg ${displayCreditScore < 50 ? "text-red-500" : "text-green-600"}`}
                >
                  {displayCreditScore}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-semibold text-lg ${
                    accountStatus === "active"
                      ? "text-green-600"
                      : accountStatus === "banned" || accountStatus === "frozen"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {capitalizeWords(accountStatus)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Withdrawal Status:</span>
                <span
                  className={`font-semibold text-lg ${
                    userProfile.withdrawalProhibited || userProfile.withdrawalStatus === "prohibited"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {userProfile.withdrawalProhibited || userProfile.withdrawalStatus === "prohibited"
                    ? "Prohibited"
                    : capitalizeWords(userProfile.withdrawalStatus || "allowed")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Dialog open={isRechargeDialogOpen} onOpenChange={setIsRechargeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">Recharge</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Recharge</DialogTitle>
              </DialogHeader>
              <Alert variant="warning" className="mb-4">
                <AlertDescription className="text-center font-semibold text-red-600">
                  For recharge, please contact your teacher.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[100, 200, 500, 1000, 2000, 5000].map((amount) => (
                  <div
                    key={amount}
                    className="border border-gray-300 rounded-md p-4 text-center h-16 flex items-center justify-center text-lg cursor-not-allowed"
                  >
                    ৳{amount.toLocaleString("en-BD")}
                  </div>
                ))}
              </div>
              <div className="w-full h-12 text-lg bg-gray-300 text-gray-600 rounded-md flex items-center justify-center cursor-not-allowed">
                Recharge Unavailable
              </div>
            </DialogContent>
          </Dialog>
          {displayCreditScore < 50 ||
          accountStatus === "banned" ||
          accountStatus === "frozen" ||
          userProfile.withdrawalProhibited ||
          userProfile.withdrawalStatus === "prohibited" ? (
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 opacity-50"
              disabled
              onClick={() =>
                toast({
                  title: "Withdrawal Restricted",
                  description:
                    displayCreditScore < 50
                      ? "Your credit score is below 50. Withdrawals are not allowed."
                      : accountStatus === "banned" || accountStatus === "frozen"
                        ? "Your account is banned or frozen. Please contact your agent."
                        : "Withdrawals are currently prohibited on your account.",
                  variant: "destructive",
                })
              }
            >
              Withdraw
            </Button>
          ) : (
            <Link href="/withdraw" passHref>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">Withdraw</Button>
            </Link>
          )}
        </div>
      </div>

      <ProfileMenu />

      {isAdmin && (
        <div className="p-4">
          <Link href="/dashboard">
            <Button className="w-full gradient-button text-white" size="lg">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      )}

      <div className="p-4">
        <Button className="w-full gradient-button text-white" size="lg" onClick={logout}>
          Logout
        </Button>
      </div>
      <BottomNav />
    </main>
  )
}

function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
