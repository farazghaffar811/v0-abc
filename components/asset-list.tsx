import { Card, CardContent } from "@/components/ui/card"

const assets = [
  { name: "Bitcoin", symbol: "BTC", amount: "0.5", value: "15,061.73" },
  { name: "Ethereum", symbol: "ETH", amount: "2.5", value: "4,725.30" },
  { name: "Binance Coin", symbol: "BNB", amount: "10", value: "2,456.70" },
  { name: "Ripple", symbol: "XRP", amount: "1000", value: "456.70" },
]

export function AssetList() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Assets</h2>
      <div className="space-y-4">
        {assets.map((asset) => (
          <Card key={asset.symbol}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-bold">{asset.name}</h3>
                <p className="text-sm text-gray-500">
                  {asset.amount} {asset.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">${asset.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
