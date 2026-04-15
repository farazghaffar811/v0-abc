"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface CryptoData {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  name?: string
}

interface MarketData {
  lastPrice: number | null
  priceChange: number | null
  priceChangePercent: number | null
  highPrice: number | null
  lowPrice: number | null
  volume: {
    usdt: number | null
    btc: number | null
  }
  transactions: number | null
}

export function useMarketData(symbol: string) {
  const [marketData, setMarketData] = useState<MarketData>({
    lastPrice: null,
    priceChange: null,
    priceChangePercent: null,
    highPrice: null,
    lowPrice: null,
    volume: {
      usdt: null,
      btc: null,
    },
    transactions: null,
  })
  const [chartData, setChartData] = useState<Array<{ time: number; value: number }>>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const useMockData = useCallback(() => {
    const mockPrice = 1000 + Math.random() * 100
    setMarketData({
      lastPrice: mockPrice,
      priceChange: Math.random() * 10 - 5,
      priceChangePercent: Math.random() * 2 - 1,
      highPrice: mockPrice * 1.05,
      lowPrice: mockPrice * 0.95,
      volume: {
        usdt: 1000000 + Math.random() * 100000,
        btc: 100 + Math.random() * 10,
      },
      transactions: 1000 + Math.floor(Math.random() * 100),
    })
    setChartData((prev) => [...prev.slice(-99), { time: Date.now(), value: mockPrice }])
    setIsUsingMockData(true)
  }, [])

  const fetchData = useCallback(async () => {
    if (isAdmin) {
      setIsUpdating(false)
      return
    }

    setIsUpdating(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const response = await fetch("/api/crypto/markets")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid data received from API")
      }

      const coinData = data.find(
        (coin: CryptoData) => coin.symbol.toLowerCase() === symbol.toLowerCase().replace("usdt", ""),
      )

      if (coinData) {
        setMarketData({
          lastPrice: coinData.current_price,
          priceChange: coinData.price_change_24h,
          priceChangePercent: coinData.price_change_percentage_24h,
          highPrice: coinData.high_24h,
          lowPrice: coinData.low_24h,
          volume: {
            usdt: coinData.total_volume,
            btc: coinData.total_volume / coinData.current_price,
          },
          transactions: null, // CoinGecko doesn't provide this data
        })

        setChartData((prev) => [...prev.slice(-99), { time: Date.now(), value: coinData.current_price }])
      } else {
        console.warn(`No data found for ${symbol}, using mock data`)
        useMockData()
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      useMockData()
    } finally {
      setIsUpdating(false)
    }
  }, [symbol, isAdmin, useMockData])

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 60000) // Update every minute
    return () => clearInterval(intervalId)
  }, [fetchData])

  return { marketData, chartData, isUpdating, error, isUsingMockData }
}
