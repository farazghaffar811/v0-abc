"use client"

import dynamic from "next/dynamic"

const DashboardContent = dynamic(() => import("./DashboardContent"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

export default function ClientDashboard() {
  return <DashboardContent />
}
