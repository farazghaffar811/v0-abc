"use client"

import { useState, useEffect } from "react"
import { MarketHeader } from "@/components/market-header"
import { ChartControls } from "@/components/chart-controls"
import { ChartTypeSelector } from "@/components/chart-type-selector"
import { SimpleChart } from "@/components/simple-chart"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"

interface MarketData {
  symbol: string
  price: string
  change: string
}

const FALLBACK_DATA: MarketData[] = [
  { symbol: "BTCUSDT", price: "30000.00", change: "+1.50%" },
  { symbol: "ETHUSDT", price: "2000.00", change: "-0.75%" },
  // Add more fallback data for other symbols
]

export function MarketContent({ initialData }: { initialData: MarketData[] | null }) {
  const [interval, setInterval] = useState("1m")
  const [showIndicators, setShowIndicators] = useState(true)
  const [chartType, setChartType] = useState<"line" | "candle" | "bar" | "area">("line")
  const [marketData, setMarketData] = useState<MarketData[]>(initialData || FALLBACK_DATA)
  const [chartData, setChartData] = useState<Array<{ time: number; value: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/crypto")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setMarketData(data)
      updateChartData(data.find((item: MarketData) => item.symbol === "BTCUSDT"))
      setLastUpdateTime(new Date())
      setError(null)
    } catch (error) {
      console.error("Error fetching market data:", error)
      setError("Failed to fetch data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateChartData = (btcData: MarketData | undefined) => {
    if (btcData) {
      const price = Number.parseFloat(btcData.price)
      setChartData((prevData) => {
        const newDataPoint = { time: Date.now(), value: price }
        const updatedData = [...prevData, newDataPoint].slice(-100)
        return updatedData
      })
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 30000) // Fetch every 30 seconds
    return () => clearInterval(intervalId)
  }, [fetchData]) // Added fetchData to dependencies

  const btcData = marketData.find((item) => item.symbol === "BTCUSDT") || FALLBACK_DATA[0]

  return (
    <>
      <MarketHeader
        data={{
          lastPrice: Number.parseFloat(btcData.price),
          priceChange: Number.parseFloat(btcData.change),
          priceChangePercent: Number.parseFloat(btcData.change),
          highPrice: Number.parseFloat(btcData.price) * 1.01,
          lowPrice: Number.parseFloat(btcData.price) * 0.99,
          volume: {
            usdt: Number.parseFloat(btcData.price) * 1000,
            btc: 1000,
          },
          transactions: 10000,
        }}
      />

      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <ChartTypeSelector selectedType={chartType} onTypeChange={setChartType} />
        <div className="border-l border-gray-300 mx-2 h-6" />
        <ChartControls
          selectedInterval={interval}
          onIntervalChange={setInterval}
          onToggleIndicators={() => setShowIndicators(!showIndicators)}
        />
      </div>

      <div className="p-4">
        {error ? (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-700 mr-2" />
            <span className="text-sm text-yellow-700">{error}</span>
            <RefreshCw className="h-5 w-5 text-yellow-700 ml-auto cursor-pointer" onClick={fetchData} />
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden mb-4 border border-gray-200">
            <SimpleChart data={chartData} width={400} height={300} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full py-6 text-lg font-medium bg-[#4CAF50] hover:bg-[#45a049] text-white">Buy Up</Button>
          <Button className="w-full py-6 text-lg font-medium bg-[#FF5252] hover:bg-[#ff3939] text-white">
            Buy Down
          </Button>
        </div>
      </div>

      {lastUpdateTime && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      )}

      {isLoading && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
    </>
  )
}
