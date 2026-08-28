import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coinId = searchParams.get("coinId") || "bittorrent"

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=1&interval=hour`,
      { headers: { Accept: "application/json", "User-Agent": "Coinbase/1.0" }, next: { revalidate: 60 } },
    )
    if (!response.ok) return NextResponse.json({ error: "Chart data unavailable" }, { status: response.status })
    const data = await response.json()
    return NextResponse.json((data.prices || []).map(([time, value]: [number, number]) => ({ time, value })))
  } catch {
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
