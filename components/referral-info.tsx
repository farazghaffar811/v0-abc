"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Copy, Users } from "lucide-react"
import { useState } from "react"

export function ReferralInfo() {
  const { userProfile } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!userProfile) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userProfile.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>Share this code with friends to earn bonuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <code className="text-lg font-mono">{userProfile.referralCode}</code>
            <Button variant="ghost" size="sm" onClick={handleCopy} className={copied ? "text-green-600" : ""}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.referralCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(userProfile.balance)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
