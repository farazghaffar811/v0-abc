"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { MarketHeader } from "@/components/market-header"
import { ChartControls } from "@/components/chart-controls"
import { Button } from "@/components/ui/button"
import { useMarketData } from "@/hooks/use-market-data"
import { Loader2, AlertCircle, ArrowUp, ArrowDown } from "lucide-react"
import { OrderPopup } from "@/components/order-popup"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

declare global {
  interface Window {
    TradingView: any
  }
}

export default function MarketPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = (params.symbol as string) || "BTCUSDT"
  const containerRef = useRef<HTMLDivElement>(null)
  const [interval, setInterval] = useState("1")
  const [showIndicators, setShowIndicators] = useState(true)
  const { marketData, chartData, isUpdating, error } = useMarketData(symbol)
  const tradingViewSymbol = symbol === "BTTUSDT" ? "POLONIEX:BTTUSDT" : `BINANCE:${symbol}`
  const [isChartReady, setIsChartReady] = useState(false)
  const [orderPopupState, setOrderPopupState] = useState<{ isOpen: boolean; type: "up" | "down" | null }>({
    isOpen: false,
    type: null,
  })

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
    if (typeof window !== "undefined" && window.TradingView && containerRef.current) {
      try {
        new window.TradingView.widget({
          width: "100%",
          height: "320",
          symbol: tradingViewSymbol,
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
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <MarketHeader data={marketData} symbol={symbol} isUpdating={isUpdating} />

      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-shrink-0 border-b border-gray-200 py-1">
        <ChartControls
          selectedInterval={interval}
          onIntervalChange={handleIntervalChange}
          onToggleIndicators={() => setShowIndicators(!showIndicators)}
        />
      </div>

      <div className="flex-grow relative">
        {!isChartReady && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-gray-500 animate-pulse">Loading chart data...</p>
            </div>
          </div>
        )}
        <div id="tradingview_chart" ref={containerRef} className="w-full h-[320px]" />
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-2 z-10">
        <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
          <Button
            className="w-full py-3 text-sm font-medium bg-green-400 hover:bg-green-500 text-white rounded-xl flex items-center justify-center gap-2"
            onClick={() => setOrderPopupState({ isOpen: true, type: "up" })}
          >
            <ArrowUp className="h-4 w-4" />
            Buy Up
          </Button>
          <Button
            className="w-full py-3 text-sm font-medium bg-[#FF5252] hover:bg-[#ff3939] text-white rounded-xl flex items-center justify-center gap-2"
            onClick={() => setOrderPopupState({ isOpen: true, type: "down" })}
          >
            <ArrowDown className="h-4 w-4" />
            Buy Down
          </Button>
        </div>
      </div>

      <OrderPopup
        isOpen={orderPopupState.isOpen}
        onClose={() => setOrderPopupState({ isOpen: false, type: null })}
        orderType={orderPopupState.type || "up"}
        symbol={symbol}
        currentPrice={marketData.lastPrice}
      />

      <BottomNav />
    </main>
  )
}
