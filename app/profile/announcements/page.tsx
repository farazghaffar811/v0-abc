"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

interface Announcement {
  id: string
  message: string
  createdAt: Date
  isRead: boolean
  fromAdmin: boolean
}

export default function SiteAnnouncementPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const announcementsRef = collection(db, "users", user.uid, "announcements")
    const q = query(announcementsRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const announcementData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Announcement[]

        setAnnouncements(announcementData)
        setIsLoading(false)

        // Mark unread announcements as read
        announcementData.forEach((announcement) => {
          if (!announcement.isRead) {
            updateDoc(doc(db, "users", user.uid, "announcements", announcement.id), {
              isRead: true,
              readAt: new Date(),
            }).catch((error) => console.error("Error marking announcement as read:", error))
          }
        })
      },
      (error) => {
        console.error("Error fetching announcements:", error)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fa]">
        <div className="bg-white border-b">
          <div className="flex items-center p-4">
            <Link href="/profile" className="mr-4">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-medium">Site Announcement</h1>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="h-1 bg-blue-500 -mx-4 -mt-4 mb-4 rounded-t-lg"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-white border-b">
        <div className="flex items-center p-4">
          <Link href="/profile" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-medium">Site Announcement</h1>
        </div>
      </div>

      {announcements.length > 0 ? (
        <div className="p-4 space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden">
              <div className="h-1 bg-blue-500"></div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-lg">Admin Announcement</div>
                  <div className="text-xs text-gray-500">{format(announcement.createdAt, "MMM d, yyyy h:mm a")}</div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
          <FileText className="h-12 w-12 mb-2" />
          <p>No announcements available</p>
        </div>
      )}
    </main>
  )
}
