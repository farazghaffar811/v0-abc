"use client"

import { useEffect, useRef, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { MarketHeader } from "@/components/market-header"
import { ChartControls } from "@/components/chart-controls"
import { Button } from "@/components/ui/button"
import { useMarketData } from "@/hooks/use-market-data"
import { Loader2, ArrowUp, ArrowDown } from "lucide-react"
import { OrderPopup } from "@/components/order-popup"

declare global {
  interface Window {
    TradingView: any
  }
}

export default function MarketPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [interval, setInterval] = useState("1")
  const [showIndicators, setShowIndicators] = useState(true)
  const { marketData, chartData } = useMarketData("BTTUSDT")
  const [isChartReady, setIsChartReady] = useState(false)
  const [orderPopupState, setOrderPopupState] = useState<{ isOpen: boolean; type: "up" | "down" | null }>({
    isOpen: false,
    type: null,
  })
  const symbol = "BTTUSDT"

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = initChart
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const initChart = () => {
    if (typeof window.TradingView !== "undefined" && containerRef.current) {
      try {
        new window.TradingView.widget({
          width: "100%",
          height: 350,
          symbol: "BINANCE:BTTUSDT",
          interval: interval,
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          studies: showIndicators ? ["MASimple@tv-basicstudies", "MACD@tv-basicstudies"] : [],
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
        })
        setIsChartReady(true)
      } catch (error) {
        console.error("Error initializing TradingView widget:", error)
      }
    }
  }

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval)
    initChart()
  }

  return (
    <main className="min-h-screen pb-20 bg-white">
      <MarketHeader data={marketData} symbol={symbol} isUpdating={false} />

      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <ChartControls
          selectedInterval={interval}
          onIntervalChange={handleIntervalChange}
          onToggleIndicators={() => {
            setShowIndicators(!showIndicators)
            initChart()
          }}
        />
      </div>

      <div className="p-2">
        {!isChartReady && (
          <div className="flex justify-center items-center h-[350px] bg-gray-50">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        <div id="tradingview_chart" ref={containerRef} />

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
