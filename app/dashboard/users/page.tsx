"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, getDocs, doc, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency, convertToINR, type Currency } from "@/lib/currency"

interface UserData {
  uid: string
  email: string
  balance: number
  realBalance?: number
  currency?: Currency
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isAdding, setIsAdding] = useState(true)
  const [amountCurrency, setAmountCurrency] = useState<Currency>("INR")
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    setIsLoading(true)
    const usersCollection = collection(db, "users")
    const userSnapshot = await getDocs(usersCollection)
    const userList = userSnapshot.docs.map((doc) => ({ ...doc.data(), uid: doc.id }) as UserData)
    setUsers(userList)
    setIsLoading(false)
  }

  const handleBalanceChange = async () => {
    if (!selectedUser) return

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) {
      toast({ title: "Error", description: "Please enter a valid number", variant: "destructive" })
      return
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", selectedUser.uid)
        const userDoc = await transaction.get(userRef)

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!")
        }

        const userData = userDoc.data()
        const currentBalance = userData.balance || 0
        const amountInINR = convertToINR(numAmount, amountCurrency)
    const newBalance = isAdding ? currentBalance + amountInINR : currentBalance - amountInINR

        if (newBalance < 0) {
          throw new Error("Insufficient balance")
        }

        transaction.update(userRef, { balance: newBalance })
      })

      toast({ title: "Success", description: `Balance ${isAdding ? "added to" : "deducted from"} user account` })
      fetchUsers()
      setIsDialogOpen(false)
      setAmount("")
    } catch (error) {
      console.error("Error updating balance:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update balance",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span>{formatCurrency(user.realBalance ?? user.balance ?? 0, user.currency ?? "INR")}</span>
                  <span className="text-xs text-muted-foreground">{user.currency ?? "INR"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setSelectedUser(user)
                    setIsAdding(true)
                    setIsDialogOpen(true)
                  }}
                  className="mr-2"
                >
                  Add Balance
                </Button>
                <Button
                  onClick={() => {
                    setSelectedUser(user)
                    setIsAdding(false)
                    setIsDialogOpen(true)
                  }}
                  variant="destructive"
                >
                  Deduct Balance
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAdding ? "Add Balance" : "Deduct Balance"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <select
                aria-label="Recharge currency"
                value={amountCurrency}
                onChange={(e) => setAmountCurrency(e.target.value as Currency)}
                className="rounded-md border bg-background px-3 text-sm"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Stored balance remains canonical INR and converts USD at the current rate.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleBalanceChange}>{isAdding ? "Add" : "Deduct"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
