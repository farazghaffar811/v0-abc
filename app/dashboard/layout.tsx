"use client"

import type React from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [searchEmail, setSearchEmail] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchEmail) {
      router.push(`/dashboard?search=${encodeURIComponent(searchEmail)}`)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="email"
                placeholder="Search member by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
