import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supercoin - Digital Trading Platform",
  description:
    "A comprehensive digital trading platform for cryptocurrency and financial markets",
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dwnt025iw/image/upload/v1758664941/favicon_jmc1ta.jpg",
        type: "image/jpeg",
        sizes: "32x32",
      },
    ],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7511077210457273"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
