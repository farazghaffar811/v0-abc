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

      // Check if BTG is included in the fetched data
      const btgData = data.find((coin: CryptoData) => coin.symbol === "btg")

      if (!btgData) {
        // If BTG is not in the fetched data, add a fallback market asset
        data.push({
          id: "btg",
          symbol: "btg",
          name: "Bitcoin Gold",
          current_price: 10,
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
