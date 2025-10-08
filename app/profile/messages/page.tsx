"use client"

import { ChevronLeft, FileText } from "lucide-react"
import Link from "next/link"

export default function SiteMessagePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-white border-b">
        <div className="flex items-center p-4">
          <Link href="/profile" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-medium">Site Message</h1>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <FileText className="h-12 w-12 mb-2" />
        <p>No data available</p>
      </div>
    </main>
  )
}
