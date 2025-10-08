"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BankDetailsDialog } from "@/components/bank-details-dialog"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CheckCircle, XCircle, Clock, Building2 } from "lucide-react"

interface WithdrawalRequest {
  id: string
  userId: string
  userEmail: string
  amount: number
  status: "pending" | "approved" | "rejected" | "completed"
  createdAt: any
  updatedAt?: any
  bankDetails?: any
}

export default function WithdrawalPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [bankDetailsOpen, setBankDetailsOpen] = useState(false)

  useEffect(() => {
    console.log("Setting up withdrawal listener...")

    // Try multiple collection names
    const collectionNames = ["withdrawals", "withdrawalRequests", "withdrawal_requests", "withdrawalRequest"]

    let unsubscribe: (() => void) | null = null

    const setupListener = async () => {
      for (const collectionName of collectionNames) {
        try {
          console.log(`Trying collection: ${collectionName}`)
          const withdrawalsRef = collection(db, collectionName)
          const q = query(withdrawalsRef, orderBy("createdAt", "desc"))

          // Test if collection exists by trying to get docs
          const testSnapshot = await getDocs(q)
          console.log(`Collection ${collectionName} found with ${testSnapshot.docs.length} documents`)

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              console.log(`Received ${snapshot.docs.length} withdrawal documents from ${collectionName}`)

              const withdrawalData = snapshot.docs.map((doc) => {
                const data = doc.data()
                console.log(`Withdrawal document ${doc.id}:`, data)

                return {
                  id: doc.id,
                  userId: data.userId || "",
                  userEmail: data.userEmail || data.email || "",
                  amount: data.amount || 0,
                  status: data.status || "pending",
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                  bankDetails: data.bankDetails || null,
                } as WithdrawalRequest
              })

              console.log("Processed withdrawal data:", withdrawalData)
              setWithdrawals(withdrawalData)
              setIsLoading(false)
            },
            (error) => {
              console.error(`Error listening to ${collectionName}:`, error)
              if (collectionName === collectionNames[collectionNames.length - 1]) {
                setIsLoading(false)
              }
            },
          )

          break // Successfully set up listener, exit loop
        } catch (error) {
          console.log(`Collection ${collectionName} not found or error:`, error)
          if (collectionName === collectionNames[collectionNames.length - 1]) {
            console.log("No withdrawal collections found")
            setIsLoading(false)
          }
        }
      }
    }

    setupListener()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleStatusUpdate = async (withdrawalId: string, newStatus: string) => {
    try {
      console.log(`Updating withdrawal ${withdrawalId} to status ${newStatus}`)

      // Try to update in multiple possible collections
      const collectionNames = ["withdrawals", "withdrawalRequests", "withdrawal_requests", "withdrawalRequest"]

      for (const collectionName of collectionNames) {
        try {
          const withdrawalRef = doc(db, collectionName, withdrawalId)
          await updateDoc(withdrawalRef, {
            status: newStatus,
            updatedAt: new Date(),
          })

          toast({
            title: "Success",
            description: `Withdrawal ${newStatus} successfully`,
          })

          console.log(`Successfully updated withdrawal in ${collectionName}`)
          return // Success, exit function
        } catch (error) {
          console.log(`Failed to update in ${collectionName}:`, error)
        }
      }

      throw new Error("Failed to update withdrawal in any collection")
    } catch (error) {
      console.error("Error updating withdrawal status:", error)
      toast({
        title: "Error",
        description: "Failed to update withdrawal status",
        variant: "destructive",
      })
    }
  }

  const handleViewBankDetails = (withdrawal: WithdrawalRequest) => {
    console.log("Opening bank details for withdrawal:", withdrawal)
    setSelectedWithdrawal(withdrawal)
    setBankDetailsOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return format(date, "MMM dd, yyyy HH:mm")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getBankDetailsStatus = (bankDetails: any) => {
    const hasDetails =
      bankDetails &&
      (bankDetails.accountName ||
        bankDetails.accountHolderName ||
        bankDetails.accountNumber ||
        bankDetails.bankName ||
        bankDetails.ifscCode)

    return hasDetails ? (
      <Badge variant="default" className="text-green-600">
        Available
      </Badge>
    ) : (
      <Badge variant="destructive">Not Set</Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Total: {withdrawals.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No withdrawal requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{withdrawal.userEmail}</div>
                          <div className="text-sm text-gray-500">{withdrawal.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>{getBankDetailsStatus(withdrawal.bankDetails)}</TableCell>
                      <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBankDetails(withdrawal)}
                            className="flex items-center gap-1"
                          >
                            <Building2 className="h-4 w-4" />
                            Bank Details
                          </Button>

                          {withdrawal.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleStatusUpdate(withdrawal.id, "approved")}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatusUpdate(withdrawal.id, "rejected")}
                                className="flex items-center gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}

                          {withdrawal.status === "approved" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusUpdate(withdrawal.id, "completed")}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWithdrawal && (
        <BankDetailsDialog
          open={bankDetailsOpen}
          onOpenChange={setBankDetailsOpen}
          userId={selectedWithdrawal.userId}
          userEmail={selectedWithdrawal.userEmail}
          withdrawalBankDetails={selectedWithdrawal.bankDetails}
        />
      )}
    </div>
  )
}
