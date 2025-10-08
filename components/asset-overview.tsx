import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AssetOverview() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Asset Overview</h2>
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$12,345.67</div>
          <p className="text-sm text-gray-500">+$123.45 (24h)</p>
        </CardContent>
      </Card>
    </div>
  )
}
