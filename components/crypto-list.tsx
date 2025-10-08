"use client"

import { Loader2, AlertTriangle, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import { useCryptoData } from "@/hooks/use-crypto-data"
import { useMemo } from "react"

const cryptoPairs = [
  { symbol: "BTC/USDT", apiSymbol: "BTCUSDT", icon: "₿" },
  { symbol: "ETH/USDT", apiSymbol: "ETHUSDT", icon: "Ξ" },
  { symbol: "DOGE/USDT", apiSymbol: "DOGEUSDT", icon: "Ð" },
  { symbol: "XRP/USDT", apiSymbol: "XRPUSDT", icon: "✕" },
  { symbol: "BNB/USDT", apiSymbol: "BNBUSDT", icon: "B" },
  { symbol: "LTC/USDT", apiSymbol: "LTCUSDT", icon: "Ł" },
  { symbol: "EOS/USDT", apiSymbol: "EOSUSDT", icon: "E" },
  { symbol: "TRX/USDT", apiSymbol: "TRXUSDT", icon: "T" },
]

export function CryptoList() {
  const { data, isLoading, error, lastUpdateTime, refetch } = useCryptoData()

  const cryptoMap = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        acc[item.symbol] = item
        return acc
      },
      {} as Record<string, (typeof data)[0]>,
    )
  }, [data])

  if (isLoading && data.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
      {isLoading && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-700 mr-2" />
          <span className="text-sm text-yellow-700">{error}</span>
          <RefreshCw className="h-5 w-5 text-yellow-700 ml-auto cursor-pointer" onClick={refetch} />
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-600 mb-2 px-2">
        <span>Currency</span>
        <span>Real Price</span>
        <span>Rise Fall</span>
      </div>

      <div className="space-y-4">
        {cryptoPairs.map((item) => {
          const price = cryptoMap[item.apiSymbol]
          const isPositive = price?.change?.startsWith("+")

          return (
            <div key={item.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-mono">
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.symbol}</span>
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  price?.priceChangeDirection === "up"
                    ? "text-green-500"
                    : price?.priceChangeDirection === "down"
                      ? "text-red-500"
                      : ""
                }`}
              >
                {price?.price || "---"}
                {price?.priceChangeDirection === "up" && <TrendingUp className="inline-block ml-1 w-4 h-4" />}
                {price?.priceChangeDirection === "down" && <TrendingDown className="inline-block ml-1 w-4 h-4" />}
              </span>
              <span className={`text-sm ${isPositive ? "text-[#4CAF50]" : "text-[#FF5252]"}`}>
                {price?.change || "---"}
              </span>
            </div>
          )
        })}
      </div>

      {lastUpdateTime && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
