"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-white border-b">
        <div className="flex items-center p-4">
          <Link href="/profile" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-medium">My Wallet</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg">
          <Link href="/profile/wallet/digital" className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4" />
                </svg>
              </div>
              <span className="text-gray-600">Digital Wallet</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link href="/profile/wallet/bank" className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M1 10h22" />
                </svg>
              </div>
              <span className="text-gray-600">Bank Wallet</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </main>
  )
}
