import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const prices = [
  { name: "BTC/USDT", price: "30,123.45", change: "+5.67%", up: true },
  { name: "ETH/USDT", price: "1,890.12", change: "-2.34%", up: false },
  { name: "BNB/USDT", price: "245.67", change: "+1.23%", up: true },
  { name: "XRP/USDT", price: "0.4567", change: "-0.89%", up: false },
]

export function PriceList() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Price List</h2>
      <div className="space-y-4">
        {prices.map((item) => (
          <Card key={item.name}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-gray-500">${item.price}</p>
              </div>
              <div className="flex items-center">
                <p className={`text-sm ${item.up ? "text-green-500" : "text-red-500"}`}>{item.change}</p>
                {item.up ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
