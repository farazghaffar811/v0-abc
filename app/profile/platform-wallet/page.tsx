"use client"

import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function PlatformWalletPage() {
  const [walletAddress, setWalletAddress] = useState("Loading...")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "platformWallet"), (doc) => {
      if (doc.exists()) {
        setWalletAddress(doc.data().address || "No address set")
      } else {
        setWalletAddress("No address set")
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-white border-b">
        <div className="flex items-center p-4">
          <Link href="/profile" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-medium">Platform Wallet</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-gray-600 mb-4">TRC20</div>
          {isLoading ? (
            <div>Loading wallet address...</div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      value={walletAddress}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="w-full h-full"
                    />
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-white">
                        <Image
                          src="/images/design-mode/logo_super_scjghk%281%29%281%29.png"
                          alt="SuperCoin Logo"
                          width={32}
                          height={32}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-6 break-all">{walletAddress}</div>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white py-3 px-6 rounded-full">Download Picture</button>
                <button className="bg-blue-600 text-white py-3 px-6 rounded-full">Copy Address</button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
