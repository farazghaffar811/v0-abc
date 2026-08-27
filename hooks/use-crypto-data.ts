"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface CryptoData {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  name?: string // Optional name property
}

export function useCryptoData() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()

  const fetchData = useCallback(async () => {
    if (isAdmin) {
      setIsLoading(false)
      return []
    }

    try {
      const response = await fetch("/api/crypto/markets")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // Keep BitTorrent available even when the market API is unavailable.
      const bttData = data.find((coin: CryptoData) => coin.symbol === "btt")

      if (!bttData) {
        data.push({
          id: "bittorrent",
          symbol: "btt",
          name: "BitTorrent",
          current_price: 0.000001,
          price_change_percentage_24h: 0.0,
        })
      }

      setCryptoData(data)
      setIsLoading(false)
      setError(null)
      return data
    } catch (error) {
      console.error("Error fetching crypto data:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setIsLoading(false)
      return []
    }
  }, [isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { cryptoData, isLoading, error, refetch: fetchData }
}
