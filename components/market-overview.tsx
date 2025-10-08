import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function MarketOverview() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC/USDT</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$30,123.45</div>
            <p className="text-xs text-green-500">+5.67%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH/USDT</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,890.12</div>
            <p className="text-xs text-red-500">-2.34%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
