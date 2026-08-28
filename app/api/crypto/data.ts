import type { CryptoData } from "@/hooks/use-crypto-data"

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price"

export async function fetchFromCoinGecko(): Promise<CryptoData[]> {
  const ids = "bitcoin,ethereum,dogecoin,xrp,binancecoin,litecoin,eos,tron"
  const vs_currencies = "usd"
  const url = `${COINGECKO_API_URL}?ids=${ids}&vs_currencies=${vs_currencies}`

  try {
    console.log("Fetching data from CoinGecko:", url)
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Ucoin/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("CoinGecko response:", JSON.stringify(data))

    const cryptoData: CryptoData[] = [
      {
        symbol: "BTCUSDT",
        price: data.bitcoin?.usd ? String(data.bitcoin.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "ETHUSDT",
        price: data.ethereum?.usd ? String(data.ethereum.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "DOGEUSDT",
        price: data.dogecoin?.usd ? String(data.dogecoin.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "XRPUSDT",
        price: data.xrp?.usd ? String(data.xrp.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "BNBUSDT",
        price: data.binancecoin?.usd ? String(data.binancecoin.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "LTCUSDT",
        price: data.litecoin?.usd ? String(data.litecoin.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "EOSUSDT",
        price: data.eos?.usd ? String(data.eos.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "TRXUSDT",
        price: data.tron?.usd ? String(data.tron.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
      {
        symbol: "BTTUSDT",
        price: data.bittorrent?.usd ? String(data.bittorrent.usd) : "N/A",
        change: "0.00%",
        priceChangeDirection: "none",
      },
    ]

    return cryptoData
  } catch (error) {
    console.error("Error fetching data from CoinGecko:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw error // Re-throw the error to be handled in the route
  }
}
