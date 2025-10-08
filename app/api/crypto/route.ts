import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { fetchFromCoinGecko } from "./data"

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"

export async function GET(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    console.log("Attempting to fetch data from CoinGecko")
    const data = await fetchFromCoinGecko()
    console.log("Successfully fetched data from CoinGecko")

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error) {
    console.error("[SERVER] Error in GET handler:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }

    // Provide fallback data
    const fallbackData = [
      { symbol: "BTCUSDT", price: "30000.00", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "ETHUSDT", price: "2000.00", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "DOGEUSDT", price: "0.07", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "XRPUSDT", price: "0.50", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "BNBUSDT", price: "300.00", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "LTCUSDT", price: "80.00", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "EOSUSDT", price: "1.00", change: "0.00%", priceChangeDirection: "none" },
      { symbol: "TRXUSDT", price: "0.07", change: "0.00%", priceChangeDirection: "none" },
    ]

    return NextResponse.json(
      { fallback: fallbackData, error: "Failed to fetch live data, using fallback" },
      { status: 200, headers: corsHeaders },
    )
  }
}

export async function OPTIONS(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  )
}
