"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useCryptoData, type CryptoData } from "@/hooks/use-crypto-data"

interface CryptoDataContextType {
  data: CryptoData[]
  isLoading: boolean
  error: string | null
  lastUpdateTime: Date | null
  refetch: () => void
}

const CryptoDataContext = createContext<CryptoDataContextType | undefined>(undefined)

export function useCryptoDataContext() {
  const context = useContext(CryptoDataContext)
  if (context === undefined) {
    throw new Error("useCryptoDataContext must be used within a CryptoDataProvider")
  }
  return context
}

interface CryptoDataProviderProps {
  children: ReactNode
}

export function CryptoDataProvider({ children }: CryptoDataProviderProps) {
  const cryptoData = useCryptoData()

  return <CryptoDataContext.Provider value={cryptoData}>{children}</CryptoDataContext.Provider>
}
