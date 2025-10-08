"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, FileText, BarChart2, DollarSign, ClipboardList, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Front Page",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Member Agent",
    icon: Users,
    href: "/dashboard/member-agent",
    submenu: [
      { title: "Member List", href: "/dashboard/member-agent/list" },
      { title: "Digital Wallet", href: "/dashboard/member-agent/digital-wallet" },
      { title: "Bank Wallet", href: "/dashboard/member-agent/bank-wallet" },
    ],
  },
  {
    title: "News Announcement",
    icon: FileText,
    href: "/dashboard/news",
  },
  {
    title: "Report Management",
    icon: BarChart2,
    href: "/dashboard/reports",
  },
  {
    title: "Money Management",
    icon: DollarSign,
    href: "/dashboard/money",
    submenu: [
      { title: "Recharge List", href: "/dashboard/money/recharge" },
      { title: "Withdrawal List", href: "/dashboard/money/withdrawal" },
      { title: "Funding Details", href: "/dashboard/money/funding" },
    ],
  },
  {
    title: "Order Management",
    icon: ClipboardList,
    href: "/dashboard/orders",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-[#2c3e50] text-white min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Flying Digital Asset</h1>
      </div>
      <nav className="p-2">
        {menuItems.map((item) => (
          <div key={item.href} className="mb-1">
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors",
                pathname === item.href && "bg-blue-700",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
              {item.submenu && <ChevronDown className="h-4 w-4 ml-auto" />}
            </Link>
            {item.submenu && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subitem) => (
                  <Link
                    key={subitem.href}
                    href={subitem.href}
                    className={cn(
                      "block px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors",
                      pathname === subitem.href && "bg-blue-700",
                    )}
                  >
                    {subitem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
