"use client"

import { useRef } from "react"
import { Loader2, AlertTriangle, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import { useCryptoData } from "@/hooks/use-crypto-data"

const pairs = [
  { symbol: "BTC/USDT", apiSymbol: "BTCUSDT" },
  { symbol: "ETH/USDT", apiSymbol: "ETHUSDT" },
  { symbol: "DOGE/USDT", apiSymbol: "DOGEUSDT" },
  { symbol: "XRP/USDT", apiSymbol: "XRPUSDT" },
  { symbol: "BNB/USDT", apiSymbol: "BNBUSDT" },
  { symbol: "LTC/USDT", apiSymbol: "LTCUSDT" },
  { symbol: "EOS/USDT", apiSymbol: "EOSUSDT" },
  { symbol: "TRX/USDT", apiSymbol: "TRXUSDT" },
]

export function CryptoPairs() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, error, lastUpdateTime, refetch } = useCryptoData()

  if (isLoading && data.length === 0) {
    return (
      <div className="bg-[#f8f9fa] py-4">
        <div className="flex overflow-x-auto scrollbar-hide gap-2 px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-white rounded-lg px-3 py-2 border border-gray-100 animate-pulse"
              style={{ minWidth: "100px", height: "80px" }}
            >
              <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] py-4">
      {isLoading && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 mx-2 p-2 bg-yellow-100 border border-yellow-300 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-700 mr-2" />
          <span className="text-sm text-yellow-700">{error}</span>
          <RefreshCw className="h-5 w-5 text-yellow-700 ml-auto cursor-pointer" onClick={refetch} />
        </div>
      )}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 px-2" ref={scrollRef}>
        {pairs.map((item) => {
          const price = data.find((p) => p.symbol === item.apiSymbol)
          const isPositive = price?.change?.startsWith("+")

          return (
            <div
              key={item.symbol}
              className="flex-shrink-0 bg-white rounded-lg px-3 py-2 border border-gray-100 flex flex-col items-center justify-center"
              style={{ minWidth: "100px", height: "80px" }}
            >
              <span className="text-xs font-medium mb-1">{item.symbol}</span>
              {price ? (
                <>
                  <span
                    className={`text-sm font-bold mb-1 transition-colors duration-300 ${
                      price.priceChangeDirection === "up"
                        ? "text-green-500"
                        : price.priceChangeDirection === "down"
                          ? "text-red-500"
                          : ""
                    }`}
                  >
                    {price.price}
                    {price.priceChangeDirection === "up" && <TrendingUp className="inline-block ml-1 w-4 h-4" />}
                    {price.priceChangeDirection === "down" && <TrendingDown className="inline-block ml-1 w-4 h-4" />}
                  </span>
                  <span className={`text-xs ${isPositive ? "text-[#4CAF50]" : "text-[#FF5252]"}`}>{price.change}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">No data</span>
              )}
            </div>
          )
        })}
      </div>
      {lastUpdateTime && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
