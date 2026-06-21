"use client"

import { ArrowLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface MarketData {
  symbol?: string
  lastPrice?: number | null
  priceChangePercent?: number | null
  volume?: number | null
  quoteVolume?: number | null
  high?: number | null
  low?: number | null
  count?: number | null
}

interface MarketHeaderProps {
  data?: MarketData | null
  symbol?: string
  isUpdating?: boolean
}

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return "0.00"
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) return "0.00"
  return price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatPercentage = (percent: number | null | undefined): string => {
  if (percent === null || percent === undefined || isNaN(percent)) return "0.00"
  return percent.toFixed(2)
}

export function MarketHeader({ data, symbol = "BTCUSDT", isUpdating = false }: MarketHeaderProps) {
  const router = useRouter()

  const priceChange = data?.priceChangePercent || 0
  const isPositive = priceChange >= 0

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 pb-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">{symbol}</h1>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Price Information */}
      <div className="px-4 pb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">${formatPrice(data?.lastPrice)}</span>
          <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}
            {formatPercentage(priceChange)}%
          </span>
        </div>

        {/* Volume Information */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <div className="text-gray-500">24H Volume(USDT)</div>
            <div className="font-medium text-gray-900">{formatNumber(data?.quoteVolume)}</div>
          </div>
          <div>
            <div className="text-gray-500">24H Volume({symbol.replace("USDT", "")})</div>
            <div className="font-medium text-gray-900">{formatNumber(data?.volume)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
