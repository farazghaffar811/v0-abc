"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, User, Wallet, BarChart3 } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/market", icon: TrendingUp, label: "Market" },
  { href: "/order", icon: BarChart3, label: "Order" },
  { href: "/asset", icon: Wallet, label: "Asset" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    if (href === "/market") {
      return pathname === "/market" || pathname.startsWith("/market/")
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              isActive(href) ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
