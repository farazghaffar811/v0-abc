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

const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&ids=bitcoin,ethereum,tether,binancecoin,ripple,usd-coin,cardano,dogecoin,solana,tron,polkadot,matic-network,litecoin,wrapped-bitcoin,dai,shiba-inu,avalanche-2,uniswap,chainlink,cosmos,monero,ethereum-classic,bitcoin-cash,stellar,algorand,near,vechain,hedera-hashgraph,filecoin,internet-computer,the-sandbox,tezos,decentraland,theta-token,axie-infinity,aave,elrond-erd-2,eos,pancakeswap-token,ecash,flow,klaytn,bittorrent,iota,neo,wrapped-staked-ether,lido-staked-ether,sui,bitshares"

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
      const response = await fetch(COINGECKO_API_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // Check if BTS is included in the fetched data
      const btsData = data.find((coin: CryptoData) => coin.symbol === "bts")

      if (!btsData) {
        // If BTS is not in the fetched data, add mock data
        data.push({
          id: "bts",
          symbol: "bts",
          name: "BitShares",
          current_price: 0.0011, // Use the provided real price
          price_change_percentage_24h: 0.0, // You may want to randomize this for more realism
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
