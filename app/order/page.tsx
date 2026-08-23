"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import { NoData } from "@/components/no-data"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, orderBy, onSnapshot, runTransaction, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ArrowUp, ArrowDown, Clock } from "lucide-react"

interface Order {
  id: string
  orderType: "up" | "down"
  symbol: string
  amount: number
  totalAmount: number
  profitAmount: number
  currentPrice: number | null
  period: { seconds: number; percentage: number }
  status: "processing" | "completed" | "cancelled"
  createdAt: Date
  completedAt?: Date
}

export default function OrderPage() {
  const [selectedTab, setSelectedTab] = useState("processing")
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, currency } = useAuth()

  useEffect(() => {
    if (!user) {
      console.log("No user found in OrderPage")
      setIsLoading(false)
      return
    }

    console.log("Fetching orders for user:", user.uid)

    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const orderData = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              // Safely convert Firestore timestamps to Date objects with fallbacks
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : undefined,
              // Ensure other required properties have defaults
              orderType: data.orderType || "up",
              symbol: data.symbol || "UNKNOWN",
              amount: data.amount || 0,
              totalAmount: data.totalAmount || 0,
              profitAmount: data.profitAmount || 0,
              period: data.period || { seconds: 0, percentage: 0 },
              status: data.status || "processing",
            }
          }) as Order[]

          console.log("Fetched orders:", orderData)
          setOrders(orderData)
          setIsLoading(false)
        } catch (error) {
          console.error("Error processing orders data:", error)
          setError("Failed to process orders data. Please try again later.")
          setIsLoading(false)
        }
      },
      (err) => {
        console.error("Error fetching orders:", err)
        setError("Failed to fetch orders. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please try again later.",
          variant: "destructive",
        })
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    // Check for any processing orders that should be completed
    const checkProcessingOrders = async () => {
      if (!user) return

      const now = new Date()

      // Filter processing orders that should be completed
      const processingOrders = orders.filter(
        (order) =>
          order.status === "processing" &&
          order.createdAt &&
          now.getTime() - order.createdAt.getTime() > order.period.seconds * 1000,
      )

      console.log(`Found ${processingOrders.length} orders to complete`)

      // Complete any orders that should be done
      for (const order of processingOrders) {
        try {
          await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, "orders", order.id)
            const userRef = doc(db, "users", user.uid)

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

            // Show toast notification when order completes
            toast({
              title: "Order Completed",
              description: `Your order has been completed with a profit of ₹${profitAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`,
            })
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
  }, [orders, user])

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === "processing") return order.status === "processing"
    if (selectedTab === "completed") return order.status === "completed"
    if (selectedTab === "cancelled") return order.status === "cancelled"
    return true
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
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
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Order</h1>
      </div>

      <Tabs defaultValue="processing" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="w-full justify-start h-12 p-0 bg-transparent border-b rounded-none">
          <TabsTrigger
            value="processing"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Processing
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processing">
          {filteredOrders.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </TabsContent>

        <TabsContent value="completed">
          {filteredOrders.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {filteredOrders.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </main>
  )
}

function OrderCard({ order }: { order: Order }) {
  const isCompleted = order.status === "completed"
  // Safely calculate profit with fallbacks for undefined values
  const profit = isCompleted ? order.profitAmount || 0 : ((order.amount || 0) * (order.period?.percentage || 0)) / 100

  return (
    <Card
      className={`overflow-hidden ${order.status === "processing" ? "border-blue-300" : order.status === "completed" ? "border-green-300" : "border-red-300"}`}
    >
      <div className={`h-2 ${order.orderType === "up" ? "bg-green-500" : "bg-red-500"}`}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{order.symbol || "Unknown"}</span>
            {order.orderType === "up" ? (
              <ArrowUp className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <Badge
            variant={
              order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "default"
            }
            className="capitalize"
          >
            {order.status || "unknown"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
          <div className="flex flex-col">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium">
              ₹{(order.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Profit</span>
            <span className={`font-medium ${isCompleted ? "text-green-600" : "text-gray-600"}`}>
              {isCompleted
                ? `+₹${profit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `+₹${profit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${order.period?.percentage || 0}%)`}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Total</span>
            <span className="font-medium">
              ₹
              {(order.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Period</span>
            <span className="font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {order.period?.seconds || "N/A"}s
            </span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div>Created: {order.createdAt ? format(order.createdAt, "yyyy-MM-dd HH:mm:ss") : "Unknown"}</div>
          {order.completedAt && <div>Completed: {format(order.completedAt, "yyyy-MM-dd HH:mm:ss")}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
