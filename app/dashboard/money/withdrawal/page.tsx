"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  runTransaction,
  serverTimestamp,
  addDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BankDetailsDialog } from "@/components/bank-details-dialog"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CheckCircle, XCircle, Clock, Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface WithdrawalRequest {
  id: string
  userId: string
  userEmail: string
  amount: number
  currency?: "INR" | "USD"
  walletType?: "bank" | "digital"
  status: "pending" | "approved" | "rejected" | "completed"
  createdAt: any
  updatedAt?: any
  bankDetails?: any
  rejectionReason?: string
}

const WITHDRAWAL_COLLECTION_NAMES = ["withdrawals", "withdrawalRequests", "withdrawal_requests", "withdrawalRequest"]

export default function WithdrawalPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [bankDetailsOpen, setBankDetailsOpen] = useState(false)

  // Reject dialog state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(null)
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    // Set up listener on the first available withdrawals collection
    let unsubscribe: (() => void) | null = null

    const setup = async () => {
      for (const collectionName of WITHDRAWAL_COLLECTION_NAMES) {
        try {
          const withdrawalsRef = collection(db, collectionName)
          const q = query(withdrawalsRef, orderBy("createdAt", "desc"))
          const testSnapshot = await getDocs(q)

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const data: WithdrawalRequest[] = snapshot.docs.map((d) => {
                const x = d.data() as any
                return {
                  id: d.id,
                  userId: x.userId || "",
                  userEmail: x.userEmail || x.email || "",
                  amount: Number(x.amount || 0),
                  currency: x.currency === "USD" ? "USD" : "INR",
                  walletType: x.walletType === "digital" ? "digital" : "bank",
                  status: (x.status || "pending") as WithdrawalRequest["status"],
                  createdAt: x.createdAt,
                  updatedAt: x.updatedAt,
                  bankDetails: x.bankDetails || null,
                  rejectionReason: x.rejectionReason || "",
                }
              })
              setWithdrawals(data)
              setIsLoading(false)
            },
            (error) => {
              console.error(`Error listening to ${collectionName}:`, error)
              setIsLoading(false)
            },
          )
          // Successfully set up listener
          break
        } catch (err) {
          // Try next collection name
          if (collectionName === WITHDRAWAL_COLLECTION_NAMES[WITHDRAWAL_COLLECTION_NAMES.length - 1]) {
            setIsLoading(false)
          }
        }
      }
    }

    setup()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Utility to find the actual withdrawal doc ref across possible collection names
  async function findWithdrawalRef(withdrawalId: string) {
    for (const name of WITHDRAWAL_COLLECTION_NAMES) {
      const ref = doc(db, name, withdrawalId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        return { ref, collectionName: name }
      }
    }
    return null
  }

  const handleApproveOrComplete = async (withdrawalId: string, newStatus: "approved" | "completed") => {
    try {
      for (const name of WITHDRAWAL_COLLECTION_NAMES) {
        try {
          const ref = doc(db, name, withdrawalId)
          await updateDoc(ref, {
            status: newStatus,
            updatedAt: serverTimestamp(),
          })
          toast({
            title: "Success",
            description: `Withdrawal ${newStatus} successfully`,
          })
          return
        } catch {
          // try next
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

  const openRejectDialog = (w: WithdrawalRequest) => {
    setRejectTarget(w)
    setRejectReason("")
    setRejectOpen(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejecting this withdrawal.",
        variant: "destructive",
      })
      return
    }

    setIsRejecting(true)

    try {
      // Locate the withdrawal document
      const found = await findWithdrawalRef(rejectTarget.id)
      if (!found) {
        throw new Error("Withdrawal document not found")
      }

      const withdrawalRef = found.ref
      const userRef = doc(db, "users", rejectTarget.userId)

      // Atomically refund and set status to rejected
      await runTransaction(db, async (txn) => {
        const userSnap = await txn.get(userRef)
        const amount = Number(rejectTarget.amount || 0)

        // If user doc does not exist, initialize balances
        if (!userSnap.exists()) {
          txn.set(
            userRef,
            {
              realBalance: amount,
              balance: amount,
              frozenAmount: 0,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        } else {
          const u = userSnap.data() as any
          const currentReal = Number(u.realBalance || 0)
          const currentFrozen = Number(u.frozenAmount || 0)
          const newReal = currentReal + amount
          const newFrozen = Math.max(currentFrozen - amount, 0)

          txn.update(userRef, {
            realBalance: newReal,
            balance: newReal, // keep in sync if used elsewhere
            frozenAmount: newFrozen,
            updatedAt: serverTimestamp(),
          })
        }

        txn.update(withdrawalRef, {
          status: "rejected",
          rejectionReason: rejectReason.trim(),
          updatedAt: serverTimestamp(),
        })
      })

      // Notify the user inside their app with the reason
      try {
        await addDoc(collection(db, "users", rejectTarget.userId, "announcements"), {
          message: `Your withdrawal request was rejected. Reason: ${rejectReason.trim()}`,
          type: "withdrawal_rejected",
          withdrawalId: rejectTarget.id,
          amount: Number(rejectTarget.amount || 0),
          createdAt: serverTimestamp(),
          isRead: false,
          fromAdmin: true,
        })
      } catch (announceErr) {
        console.warn("Failed to add user announcement:", announceErr)
      }

      toast({
        title: "Withdrawal rejected",
        description: "Amount has been returned to the user's account and reason recorded.",
      })
      setRejectOpen(false)
    } catch (error: any) {
      console.error("Error rejecting withdrawal:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to reject withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const handleViewBankDetails = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal)
    setBankDetailsOpen(true)
  }

  const formatCurrency = (amount: number, currency: "INR" | "USD" = "INR") => {
    const locale = currency === "USD" ? "en-US" : "en-IN"
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0))
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
      return format(date, "MMM dd, yyyy HH:mm")
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      approved: { variant: "default" as const, icon: CheckCircle },
      rejected: { variant: "destructive" as const, icon: XCircle },
      completed: { variant: "default" as const, icon: CheckCircle },
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
                      <TableCell>
                        {withdrawal.bankDetails &&
                        (withdrawal.bankDetails.accountName ||
                          withdrawal.bankDetails.accountHolderName ||
                          withdrawal.bankDetails.accountNumber ||
                          withdrawal.bankDetails.bankName ||
                          withdrawal.bankDetails.ifscCode) ? (
                          <Badge variant="default" className="text-green-600">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Not Set</Badge>
                        )}
                      </TableCell>
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
                                onClick={() => handleApproveOrComplete(withdrawal.id, "approved")}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openRejectDialog(withdrawal)}
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
                              onClick={() => handleApproveOrComplete(withdrawal.id, "completed")}
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

      {/* Bank details dialog */}
      {selectedWithdrawal && (
        <BankDetailsDialog
          open={bankDetailsOpen}
          onOpenChange={setBankDetailsOpen}
          userId={selectedWithdrawal.userId}
          userEmail={selectedWithdrawal.userEmail}
          withdrawalBankDetails={selectedWithdrawal.bankDetails}
          withdrawalId={selectedWithdrawal.id}
        />
      )}

      {/* Reject reason dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this withdrawal. The user will see this message in their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">
              <div>
                <span className="font-medium">User:</span>{" "}
                <span className="text-gray-600">{rejectTarget?.userEmail}</span>
              </div>
              <div>
                <span className="font-medium">Amount:</span>{" "}
                <span className="text-gray-600">{formatCurrency(rejectTarget?.amount || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Write the rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button onClick={handleRejectSubmit} disabled={isRejecting || !rejectReason.trim()}>
              {isRejecting ? "Rejecting..." : "Reject Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
