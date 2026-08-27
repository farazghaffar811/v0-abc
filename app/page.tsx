"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowUpRight, ArrowDownRight, Coins } from "lucide-react"
import { ImageSlider } from "@/components/image-slider"
import { useCryptoData } from "@/hooks/use-crypto-data"
import { HomeHeader } from "@/components/home-header"
import Image from "next/image"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { user, isLoading: authLoading, isAdmin, error } = useAuth()
  const router = useRouter()
  const { cryptoData: initialCryptoData, isLoading: cryptoLoading, error: cryptoError, refetch } = useCryptoData()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [cryptoData, setCryptoData] = useState(initialCryptoData)

  useEffect(() => {
    console.log("HomePage useEffect - authLoading:", authLoading, "user:", user?.uid, "isAdmin:", isAdmin)
    if (!authLoading) {
      if (!user) {
        console.log("No user found, redirecting to login")
        router.push("/login")
      } else if (isAdmin) {
        console.log("Admin user detected, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        console.log("Regular user detected, staying on home page")
      }
    }
  }, [user, authLoading, router, isAdmin])

  useEffect(() => {
    if (user && !isAdmin) {
      const userRef = doc(db, "users", user.uid)
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile)
          }
        },
        (error) => {
          console.error("Error fetching user profile:", error)
        },
      )

      return () => unsubscribe()
    }
  }, [user, isAdmin])

  useEffect(() => {
    setCryptoData(initialCryptoData)
  }, [initialCryptoData])

  const updateCryptoData = useCallback(async () => {
    if (!isAdmin && !cryptoLoading) {
      console.log("Fetching updated crypto data")
      const updatedData = await refetch()
      // Add BTG to the fetched data
      const btgData = {
        id: "btg",
        symbol: "btg",
        name: "Bitcoin Gold",
        current_price: 10,
        price_change_percentage_24h: 0,
      }
      setCryptoData([...updatedData.filter((coin: any) => coin.symbol !== "btg"), btgData])
    }
  }, [isAdmin, cryptoLoading, refetch])

  useEffect(() => {
    if (!isAdmin && !cryptoLoading) {
      const intervalId = setInterval(async () => {
        console.log("Fetching updated crypto data")
        await updateCryptoData()
      }, 10000) // 10 seconds

      return () => clearInterval(intervalId)
    }
  }, [isAdmin, cryptoLoading, updateCryptoData])

  const handleCurrencyClick = useCallback(async (symbol: string) => {
    try {
      console.log("Currency clicked:", symbol)
      const marketUrl = `/market/${symbol.toUpperCase()}USDT`
      console.log("Attempting navigation to:", marketUrl)

      // Use window.location for hard navigation
      window.location.href = marketUrl
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }, [])

  if (authLoading || (cryptoLoading && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || (cryptoError && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error?.message || cryptoError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // If user is not admin, show the main web app content
  if (user && !isAdmin && userProfile) {
    const allCryptoData = cryptoData

    const getCurrencyLogo = (symbol: string) => {
      const logoMap: { [key: string]: string } = {
        btc: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
        eth: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
        usdt: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
        bnb: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png",
        usdc: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
        xrp: "https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png",
        ada: "https://assets.coingecko.com/coins/images/975/thumb/cardano.png",
        doge: "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png",
        sol: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png",
        trx: "https://assets.coingecko.com/coins/images/1094/thumb/tron-logo.png",
        dot: "https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png",
        matic: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png",
        ltc: "https://assets.coingecko.com/coins/images/2/thumb/litecoin.png",
        wbtc: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png",
        dai: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png",
        shib: "https://assets.coingecko.com/coins/images/11939/thumb/shiba.png",
        avax: "https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png",
        uni: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png",
        link: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
        atom: "https://assets.coingecko.com/coins/images/1481/thumb/cosmos_hub.png",
        xmr: "https://assets.coingecko.com/coins/images/69/thumb/monero_logo.png",
        etc: "https://assets.coingecko.com/coins/images/453/thumb/ethereum-classic-logo.png",
        bch: "https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash-circle.png",
        xlm: "https://assets.coingecko.com/coins/images/100/thumb/Stellar_symbol_black_RGB.png",
        algo: "https://assets.coingecko.com/coins/images/4380/thumb/download.png",
        near: "https://assets.coingecko.com/coins/images/10365/thumb/near_icon.png",
        vet: "https://assets.coingecko.com/coins/images/1167/thumb/VeChain-Logo-768x725.png",
        hbar: "https://assets.coingecko.com/coins/images/3688/thumb/hbar.png",
        fil: "https://assets.coingecko.com/coins/images/12817/thumb/filecoin.png",
        icp: "https://assets.coingecko.com/coins/images/14495/thumb/Internet_Computer_logo.png",
        sand: "https://assets.coingecko.com/coins/images/12129/thumb/sandbox_logo.jpg",
        xtz: "https://assets.coingecko.com/coins/images/976/thumb/Tezos-logo.png",
        mana: "https://assets.coingecko.com/coins/images/878/thumb/decentraland-mana.png",
        theta: "https://assets.coingecko.com/coins/images/2538/thumb/theta-token-logo.png",
        axs: "https://assets.coingecko.com/coins/images/13029/thumb/axie_infinity_logo.png",
        aave: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png",
        egld: "https://assets.coingecko.com/coins/images/12335/thumb/elrond3_360.png",
        eos: "https://assets.coingecko.com/coins/images/738/thumb/eos-eos-logo.png",
        cake: "https://assets.coingecko.com/coins/images/12632/thumb/pancakeswap-cake-logo_%281%29.png",
        xec: "https://assets.coingecko.com/coins/images/16646/thumb/Logo_final-22.png",
        flow: "https://assets.coingecko.com/coins/images/13446/thumb/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png",
        klay: "https://assets.coingecko.com/coins/images/9672/thumb/klaytn.png",
        btt: "https://assets.coingecko.com/coins/images/22457/thumb/btt_logo.png",
        miota: "https://assets.coingecko.com/coins/images/692/thumb/IOTA_Swirl.png",
        neo: "https://assets.coingecko.com/coins/images/480/thumb/NEO_512_512.png",
        wsteth: "https://assets.coingecko.com/coins/images/18834/thumb/wstETH.png",
        steth: "https://assets.coingecko.com/coins/images/13442/thumb/steth_logo.png",
        sui: "https://assets.coingecko.com/coins/images/26375/thumb/sui_asset.jpeg",
        btg: "https://assets.coingecko.com/coins/images/1043/thumb/bitcoin-gold.png",
      }
      return logoMap[symbol.toLowerCase()] || null
    }

    return (
      <main className="min-h-screen pb-20 bg-white text-black">
        <HomeHeader />
        <div className="p-4">
          <ImageSlider
            images={[
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/slider2.PNG-XZatDvoC83tqsMB8rjzfJLVnsKqomx.png",
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/slider1.PNG-ox0d44YYowC8nXF8vQgZl1kQzRn238.png",
            ]}
            className="mb-4"
            height={150}
          />
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-4">
              {allCryptoData.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 rounded-lg p-2 min-w-[120px] bg-white ${
                    item.price_change_percentage_24h >= 0 ? "border-green-500" : "border-red-500"
                  } border-2`}
                >
                  <div className="text-xs font-medium mb-1">{item.symbol.toUpperCase()}/USDT</div>
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      item.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ${item.current_price.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs flex items-center ${
                      item.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.price_change_percentage_24h.toFixed(2)}%
                    {item.price_change_percentage_24h >= 0 ? (
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Currency</h2>
            <h2 className="text-xl font-semibold">Real Price</h2>
            <h2 className="text-xl font-semibold">Rise/Fall</h2>
          </div>
          <div className="space-y-4">
            {allCryptoData.map((item) => {
              const logoSrc = getCurrencyLogo(item.symbol)
              const fallbackSrc =
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-7xwKBDgALRLBn6vyD9tQgfeCo3YHNa.svg"

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 cursor-pointer"
                  onClick={() => handleCurrencyClick(item.symbol)}
                >
                  <span className="font-medium flex items-center">
                    {logoSrc ? (
                      <Image
                        src={logoSrc || "/placeholder.svg"}
                        alt={`${item.symbol} Logo`}
                        width={32}
                        height={32}
                        className="mr-2 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 mr-2 flex items-center justify-center bg-gray-200 rounded-full">
                        <Coins className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    {`${item.symbol.toUpperCase()}/USDT`}
                  </span>
                  <span className={`${item.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {item.current_price.toFixed(2)}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-sm ${
                      item.price_change_percentage_24h >= 0 ? "bg-green-500" : "bg-red-500"
                    } text-white flex items-center justify-center w-[80px]`}
                  >
                    {item.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <BottomNav />
        {isAdmin && (
          <div className="p-4">
            <Link href="/dashboard">
              <Button className="w-full gradient-button text-white" size="lg">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        )}
      </main>
    )
  }

  // This will only be shown briefly before redirection for admin users or non-authenticated users
  return null
}
