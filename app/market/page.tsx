"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { MarketHeader } from "@/components/market-header"
import { ChartControls } from "@/components/chart-controls"
import { PriceChart } from "@/components/price-chart"
import { Button } from "@/components/ui/button"
import { useMarketData } from "@/hooks/use-market-data"
import { ArrowUp, ArrowDown } from "lucide-react"
import { OrderPopup } from "@/components/order-popup"

export default function MarketPage() {
  const [interval, setInterval] = useState("1")
  const [, setShowIndicators] = useState(true)
  const { marketData, chartData } = useMarketData("BTTUSDT")
  const [orderPopupState, setOrderPopupState] = useState<{ isOpen: boolean; type: "up" | "down" | null }>({
    isOpen: false,
    type: null,
  })
  const symbol = "BTTUSDT"

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval)
  }

  return (
    <main className="min-h-screen pb-20 bg-white">
      <MarketHeader data={marketData} symbol={symbol} isUpdating={false} />

      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <ChartControls
          selectedInterval={interval}
          onIntervalChange={handleIntervalChange}
          onToggleIndicators={() => setShowIndicators(!showIndicators)}
        />
      </div>

      <div className="p-2">
        <div className="rounded-lg bg-gray-50 p-2">
          <PriceChart data={chartData} height={350} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            className="w-full py-4 text-sm font-medium bg-green-400 hover:bg-green-500 text-white rounded-xl flex items-center justify-center gap-2"
            onClick={() => setOrderPopupState({ isOpen: true, type: "up" })}
          >
            <ArrowUp className="h-4 w-4" />
            Buy Up
          </Button>
          <Button
            className="w-full py-4 text-sm font-medium bg-[#FF5252] hover:bg-[#ff3939] text-white rounded-xl flex items-center justify-center gap-2"
            onClick={() => setOrderPopupState({ isOpen: true, type: "down" })}
          >
            <ArrowDown className="h-4 w-4" />
            Buy Down
          </Button>
        </div>
        <OrderPopup
          isOpen={orderPopupState.isOpen}
          onClose={() => setOrderPopupState({ isOpen: false, type: null })}
          orderType={orderPopupState.type || "up"}
          symbol={symbol}
          currentPrice={marketData.lastPrice || null}
        />
      </div>

      <BottomNav />
    </main>
  )
}
