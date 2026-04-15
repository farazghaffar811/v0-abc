export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&ids=bitcoin,ethereum,tether,binancecoin,ripple,usd-coin,cardano,dogecoin,solana,tron,polkadot,matic-network,litecoin,wrapped-bitcoin,dai,shiba-inu,avalanche-2,uniswap,chainlink,cosmos,monero,ethereum-classic,bitcoin-cash,stellar,algorand,near,vechain,hedera-hashgraph,filecoin,internet-computer,the-sandbox,tezos,decentraland,theta-token,axie-infinity,aave,elrond-erd-2,eos,pancakeswap-token,ecash,flow,klaytn,bittorrent,iota,neo,wrapped-staked-ether,lido-staked-ether,sui,bitshares",
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
        "Cache-Control": "public, max-age=60",
      },
    })
  } catch (error) {
    console.error("Error fetching crypto markets:", error)
    return Response.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 }
    )
  }
}
