"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User, Wallet, Shield, Smartphone, Bell, MessageSquare, Building, ChevronRight } from "lucide-react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

const menuItems = [
  {
    icon: User,
    label: "Personal Information",
    href: "/profile/personal",
    iconBackground: "bg-blue-100",
  },
  {
    icon: Wallet,
    label: "My Wallet",
    href: "/profile/wallet",
    iconBackground: "bg-yellow-100",
  },
  {
    icon: Shield,
    label: "Security Settings",
    href: "/profile/security",
    iconBackground: "bg-green-100",
  },
  {
    icon: Smartphone,
    label: "Platform Wallet",
    href: "/profile/platform-wallet",
    iconBackground: "bg-red-100",
  },
  {
    icon: Bell,
    label: "Site Announcement",
    href: "/profile/announcements",
    iconBackground: "bg-purple-100",
    hasBadge: true,
  },
  {
    icon: MessageSquare,
    label: "Site Message",
    href: "/profile/messages",
    iconBackground: "bg-orange-100",
  },
  {
    icon: Building,
    label: "About Company",
    href: "/profile/about",
    iconBackground: "bg-cyan-100",
  },
]

export function ProfileMenu() {
  const { user } = useAuth()
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0)

  useEffect(() => {
    if (!user) return

    // Get unread announcements count
    const announcementsRef = collection(db, "users", user.uid, "announcements")
    const q = query(announcementsRef, where("isRead", "==", false))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUnreadAnnouncementCount(snapshot.docs.length)
      },
      (error) => {
        console.error("Error getting unread announcements:", error)
      },
    )

    return () => unsubscribe()
  }, [user])

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm divide-y">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${item.iconBackground}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
              {item.hasBadge && unreadAnnouncementCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadAnnouncementCount}
                </span>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
