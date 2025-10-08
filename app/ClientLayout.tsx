"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { DisableZoom } from "@/components/DisableZoom"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <AuthProvider>
      <div onContextMenu={handleContextMenu} className="select-none">
        <DisableZoom />
        {children}
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export { ClientLayout }
