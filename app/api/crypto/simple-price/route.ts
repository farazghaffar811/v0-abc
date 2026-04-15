export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get("ids") || "bitcoin,ethereum,dogecoin,xrp,binancecoin,litecoin,eos,tron"

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SuperCoin/1.0",
        },
      }
    )

    if (!response.ok) {
      return Response.json(
        { error: `CoinGecko API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    })
  } catch (error) {
    console.error("Error fetching simple prices:", error)
    return Response.json(
      { error: "Failed to fetch price data" },
      { status: 500 }
    )
  }
}
