import type React from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const authCookie = headersList.get("cookie")?.includes("auth=")

  if (!authCookie) {
    redirect("/login")
  }

  return <>{children}</>
}
