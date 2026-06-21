"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, runTransaction, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"

interface Order {
  id: string
  userId: string
  userEmail: string
  symbol: string
  orderType: "up" | "down"
  amount: number
  totalAmount: number
  profitAmount: number
  period: { seconds: number; percentage: number }
  status: "processing" | "completed" | "cancelled"
  createdAt: Date
  completedAt?: Date
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          completedAt: doc.data().completedAt?.toDate() || null,
        })) as Order[]
        console.log("Fetched orders:", orderData)
        setOrders(orderData)
        setFilteredOrders(orderData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching orders:", error)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const searchTermLower = searchTerm.toLowerCase().trim()
      const filtered = orders.filter((order) => {
        // Safely check each property before accessing it
        const email = order.userEmail ? order.userEmail.toLowerCase() : ""
        const symbol = order.symbol ? order.symbol.toLowerCase() : ""
        const id = order.id ? order.id.toLowerCase() : ""

        return email.includes(searchTermLower) || symbol.includes(searchTermLower) || id.includes(searchTermLower)
      })
      setFilteredOrders(filtered)
    }
  }, [searchTerm, orders])

  // Auto-complete processing orders
  useEffect(() => {
    const checkProcessingOrders = async () => {
      const now = new Date()

      // Filter processing orders that should be completed
      const processingOrders = orders.filter(
        (order) =>
          order.status === "processing" &&
          order.createdAt &&
          order.period &&
          now.getTime() - order.createdAt.getTime() > order.period.seconds * 1000,
      )

      console.log(`Found ${processingOrders.length} orders to complete`)

      // Complete any orders that should be done
      for (const order of processingOrders) {
        try {
          await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, "orders", order.id)
            const userRef = doc(db, "users", order.userId)

            const [orderDoc, userDoc] = await Promise.all([transaction.get(orderRef), transaction.get(userRef)])

            if (!orderDoc.exists() || !userDoc.exists()) return

            const orderData = orderDoc.data()
            if (orderData.status !== "processing") return

            const userData = userDoc.data()
            const profitAmount = (order.amount * order.period.percentage) / 100
            const totalAmount = order.amount + profitAmount
            const newRealBalance = userData.realBalance + totalAmount

            transaction.update(orderRef, {
              status: "completed",
              completedAt: serverTimestamp(),
              profitAmount: profitAmount,
              totalAmount: totalAmount,
            })

            transaction.update(userRef, {
              realBalance: newRealBalance,
              balance: newRealBalance,
            })

            console.log(`Order ${order.id} completed automatically`)
          })
        } catch (error) {
          console.error(`Error completing order ${order.id}:`, error)
        }
      }
    }

    // Run check whenever orders change
    if (orders.length > 0) {
      checkProcessingOrders()
    }

    // Also set up an interval to check orders regularly
    const interval = setInterval(checkProcessingOrders, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [orders])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Search is already handled by the useEffect
      console.log("Searching for:", searchTerm)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const handleReset = () => {
    setSearchTerm("")
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading order history...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>

      <div className="mb-6 flex gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            try {
              // Search is already handled by the useEffect
              console.log("Searching for:", searchTerm)
            } catch (error) {
              console.error("Search error:", error)
            }
          }}
          className="flex-1 flex gap-2"
        >
          <Input
            type="text"
            placeholder="Search by email, symbol or order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Completed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>{order.userEmail || "N/A"}</TableCell>
              <TableCell>{order.symbol}</TableCell>
              <TableCell>
                <Badge variant={order.orderType === "up" ? "success" : "destructive"}>
                  {order.orderType === "up" ? "UP" : "DOWN"}
                </Badge>
              </TableCell>
              <TableCell>৳{order.amount?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>৳{order.profitAmount?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>৳{order.totalAmount?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>
                {order.period && typeof order.period === "object" && order.period.seconds && order.period.percentage
                  ? `${order.period.seconds}s (${order.period.percentage}%)`
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "default"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{format(order.createdAt, "yyyy-MM-dd HH:mm:ss")}</TableCell>
              <TableCell>
                {order.completedAt
                  ? format(order.completedAt, "yyyy-MM-dd HH:mm:ss")
                  : order.status === "processing"
                    ? "In progress"
                    : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredOrders.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No orders found. {searchTerm && "Try a different search term."}
        </div>
      )}
    </div>
  )
}
