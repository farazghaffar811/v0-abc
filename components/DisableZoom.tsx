"use client"

import { useEffect } from "react"

export function DisableZoom() {
  useEffect(() => {
    // 1️⃣ Ensure we set correct viewport meta
    let viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      viewport = document.createElement("meta")
      viewport.setAttribute("name", "viewport")
      document.head.appendChild(viewport)
    }
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    )

    // 2️⃣ Prevent pinch zoom
    const handleGestureStart = (e: Event) => e.preventDefault()
    document.addEventListener("gesturestart", handleGestureStart)

    // 3️⃣ Prevent double-tap zoom
    let lastTouchEnd = 0
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) e.preventDefault()
      lastTouchEnd = now
    }
    document.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener("gesturestart", handleGestureStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return null
}
