"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import { NoData } from "@/components/no-data"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Withdrawal {
  id: string
  userId: string
  userEmail: string
  amount: number
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  bankDetails?: {
    bankName: string
    accountName: string
    accountNumber: string
    ifscCode: string
  }
  declineComment?: string
  rejectionReason?: string
}

export default function AssetPage() {
  const [selectedTab, setSelectedTab] = useState("withdraws")
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      setError("User not authenticated")
      return
    }

    setError(null)
    const withdrawalsRef = collection(db, "withdrawals")
    const q = query(withdrawalsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Snapshot received, docs:", snapshot.docs.length)
        const withdrawalData = snapshot.docs.map((doc) => {
          const raw = doc.data() as any
          return {
            id: doc.id,
            userId: raw.userId || "",
            userEmail: raw.userEmail || raw.email || "",
            amount: Number(raw.amount || 0),
            status: (raw.status || "pending") as Withdrawal["status"],
            createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(),
            bankDetails: raw.bankDetails || undefined,
            // prefer the new admin field but remain backward compatible
            rejectionReason: raw.rejectionReason || raw.declineComment || raw.reason || undefined,
            declineComment: raw.declineComment || undefined,
          } as Withdrawal
        })
        setWithdrawals(withdrawalData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error in onSnapshot:", error)
        if (error.code === "failed-precondition") {
          setError("The query requires an index. Please contact the administrator to set up the necessary index.")
        } else {
          setError(`Error in real-time updates: ${error.message}`)
        }
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const renderWithdrawalList = () => {
    if (isLoading) {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (withdrawals.length === 0) {
      return <NoData />
    }

    return (
      <div className="space-y-4">
        {withdrawals.map((withdrawal) => (
          <Card key={withdrawal.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Amount: ₹
                    {withdrawal.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500">{format(withdrawal.createdAt, "MMM d, yyyy HH:mm")}</p>
                  {withdrawal.bankDetails && (
                    <p className="text-sm text-gray-500">Bank: {withdrawal.bankDetails.bankName}</p>
                  )}
                  {withdrawal.status === "rejected" && (withdrawal.rejectionReason || withdrawal.declineComment) && (
                    <p className="text-sm text-red-500 mt-2">
                      Reason: {withdrawal.rejectionReason || withdrawal.declineComment}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    withdrawal.status === "approved"
                      ? "success"
                      : withdrawal.status === "rejected"
                        ? "destructive"
                        : "default"
                  }
                >
                  {withdrawal.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Asset</h1>
        <select className="text-sm border rounded px-2 py-1">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full justify-start h-12 p-0 bg-transparent border-b rounded-none">
          <TabsTrigger
            value="recharges"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Recharges
          </TabsTrigger>
          <TabsTrigger
            value="withdraws"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Withdraws
          </TabsTrigger>
          <TabsTrigger
            value="funds"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Funds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recharges">
          <NoData />
        </TabsContent>

        <TabsContent value="withdraws" className="p-4">
          {renderWithdrawalList()}
        </TabsContent>

        <TabsContent value="funds">
          <NoData />
        </TabsContent>
      </Tabs>

      <BottomNav />
    </main>
  )
}
