"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { doc, addDoc, collection, serverTimestamp, runTransaction, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { ArrowUp, ArrowDown, Loader2, Clock, TrendingUp, TrendingDown } from "lucide-react"

interface OrderPopupProps {
  isOpen: boolean
  onClose: () => void
  orderType: "up" | "down"
  symbol: string
  currentPrice: number | null
}

const periods = [
  { seconds: 30, percentage: 20 },
  { seconds: 60, percentage: 30 },
  { seconds: 120, percentage: 40 },
  { seconds: 180, percentage: 50 },
  { seconds: 240, percentage: 60 },
]

export function OrderPopup({ isOpen, onClose, orderType, symbol, currentPrice }: OrderPopupProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0])
  const [amount, setAmount] = useState("")
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid)
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile)
        }
      })
      return () => unsubscribe()
    }
  }, [user])

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      setAmount("")
      setSelectedPeriod(periods[0])
      setIsProcessing(false)
      setTimeLeft(0)
      setOrderId(null)
    }
  }, [isOpen])

  const totalAmount = useMemo(() => {
    const baseAmount = Number.parseFloat(amount) || 0
    const profitAmount = (baseAmount * selectedPeriod.percentage) / 100
    return baseAmount + profitAmount
  }, [amount, selectedPeriod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) {
      toast({ title: "Error", description: "You must be logged in to place an order.", variant: "destructive" })
      return
    }

    const orderAmount = Number.parseFloat(amount)
    if (isNaN(orderAmount) || orderAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid order amount.", variant: "destructive" })
      return
    }

    const MIN_ORDER_AMOUNT = 1000
    if (orderAmount < MIN_ORDER_AMOUNT) {
      toast({ title: "Error", description: `Minimum order amount is ${MIN_ORDER_AMOUNT}.`, variant: "destructive" })
      return
    }

    if (orderAmount > userProfile.realBalance) {
      toast({ title: "Error", description: "Insufficient balance.", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    setTimeLeft(selectedPeriod.seconds)

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await transaction.get(userRef)

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!")
        }

        const userData = userDoc.data() as UserProfile
        const newBalance = userData.realBalance - orderAmount

        if (newBalance < 0) {
          throw new Error("Insufficient balance")
        }

        const orderData = {
          userId: user.uid,
          userEmail: user.email,
          orderType,
          symbol,
          amount: orderAmount,
          totalAmount,
          currentPrice,
          period: selectedPeriod,
          status: "processing",
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + selectedPeriod.seconds * 1000),
        }

        transaction.update(userRef, { realBalance: newBalance })
        return orderData
      }).then(async (orderData) => {
        const ordersRef = collection(db, "orders")
        const newOrderRef = await addDoc(ordersRef, orderData)
        setOrderId(newOrderRef.id)

        const timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            const newTime = prevTime - 1
            if (newTime <= 0) {
              clearInterval(timer)
              completeOrder(newOrderRef.id, orderAmount, totalAmount)
              return 0
            }
            return newTime
          })
        }, 1000)
      })

      toast({ title: "Success", description: "Order submitted successfully and balance updated." })
      router.push("/order")
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit order",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const completeOrder = async (orderId: string, orderAmount: number, totalAmount: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId)
        const userRef = doc(db, "users", user!.uid)

        const [orderDoc, userDoc] = await Promise.all([transaction.get(orderRef), transaction.get(userRef)])

        if (!orderDoc.exists()) {
          throw new Error("Order document does not exist!")
        }

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!")
        }

        const orderData = orderDoc.data()

        if (orderData.status === "completed") {
          console.log("Order already completed, skipping")
          return
        }

        const userData = userDoc.data() as UserProfile
        const profitAmount = totalAmount - orderAmount
        const newRealBalance = userData.realBalance + totalAmount

        transaction.update(orderRef, {
          status: "completed",
          completedAt: serverTimestamp(),
          profitAmount: profitAmount,
        })

        transaction.update(userRef, {
          realBalance: newRealBalance,
          balance: newRealBalance,
        })

        console.log("Order completed successfully. New balance:", newRealBalance)
      })

      toast({
        title: "Order Completed",
        description: `Your order has been completed with a profit of ${(totalAmount - orderAmount).toFixed(2)}!`,
      })
    } catch (error) {
      console.error("Error completing order:", error)
      toast({
        title: "Error",
        description: "Failed to complete order. Please check your orders for details.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[55vh] sm:h-[50vh] md:h-[45vh] bg-gray-50 rounded-t-xl border-t-4 border-primary flex flex-col"
      >
        <SheetHeader className="text-center py-1 flex-shrink-0">
          <SheetTitle className="text-sm flex items-center justify-center gap-2">
            {orderType === "up" ? (
              <>
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Buy Up</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">Buy Down</span>
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-2 sm:px-3 pb-2 sm:pb-3 flex flex-col overflow-y-auto">
          {isProcessing ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <p className="text-sm font-bold mb-1">Processing Order</p>
              <p className="text-gray-600 text-xs mb-1">Order completes in:</p>
              <p className="text-xl font-bold text-primary animate-pulse">{timeLeft}s</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Please wait...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg p-2 shadow-sm mb-2 flex-1 min-h-0">
                {/* Balance */}
                <div className="flex justify-between items-center mb-2 pb-1 border-b">
                  <span className="text-xs font-medium">Available Balance:</span>
                  <span className="text-primary font-bold text-xs">
                    ₹
                    {userProfile?.realBalance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "0.00"}
                  </span>
                </div>

                {/* Amount Input */}
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold">Order Amount</span>
                  </div>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (min: 1000)"
                    className="py-1 text-xs h-7"
                    disabled={isProcessing}
                  />
                </div>

                {/* Period Selection */}
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold">Trading Period</span>
                  </div>
                  <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
                    {periods.map((period) => (
                      <Button
                        key={period.seconds}
                        type="button"
                        variant={selectedPeriod.seconds === period.seconds ? "default" : "outline"}
                        className={`py-0.5 px-0.5 sm:py-1 sm:px-1 text-xs h-auto ${
                          selectedPeriod.seconds === period.seconds
                            ? orderType === "up"
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-red-500 text-white hover:bg-red-600"
                            : "bg-white"
                        }`}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold">{period.seconds}s</span>
                          <span className="text-xs">{period.percentage}%</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Summary Table */}
                <div className="bg-gray-50 rounded p-1 text-xs">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-0.5 sm:py-1 font-medium text-xs">Currency:</td>
                        <td className="py-0.5 sm:py-1 text-xs">{symbol}</td>
                        <td className="py-0.5 sm:py-1 font-medium text-xs">Price:</td>
                        <td className="py-0.5 sm:py-1 text-xs">${currentPrice?.toFixed(2) || "0.00"}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-0.5 sm:py-1 font-medium text-xs">Profit ({selectedPeriod.percentage}%):</td>
                        <td className="py-0.5 sm:py-1 text-green-500 font-medium text-xs">
                          +{(((Number.parseFloat(amount) || 0) * selectedPeriod.percentage) / 100).toFixed(2)}
                        </td>
                        <td className="py-0.5 sm:py-1 font-medium text-xs">Total:</td>
                        <td className="py-0.5 sm:py-1 font-bold text-primary text-xs">
                          ₹
                          {totalAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="text-center py-0.5 sm:py-1 text-gray-500">
                          {orderType === "up" ? (
                            <div className="flex items-center justify-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span className="text-xs">Predicting price UP in {selectedPeriod.seconds}s</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <TrendingDown className="h-3 w-3 text-red-500" />
                              <span className="text-xs">Predicting price DOWN in {selectedPeriod.seconds}s</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-auto pt-2 border-t bg-gray-50 -mx-2 sm:-mx-3 px-2 sm:px-3 pb-2 sm:pb-3">
                <Button
                  onClick={handleSubmit}
                  className={`w-full py-3 sm:py-2 text-sm sm:text-xs font-bold rounded-lg ${
                    orderType === "up"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  disabled={isProcessing || !amount || Number(amount) <= 0}
                >
                  Submit Order
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
