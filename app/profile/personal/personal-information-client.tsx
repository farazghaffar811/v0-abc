"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PersonalInformationClient() {
  const [profile, setProfile] = useState({
    avatar: "",
    username: "",
    gender: "",
    signature: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      setProfile(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })
      const data = await response.json()
      setProfile(data)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-white border-b">
        <div className="flex items-center p-4">
          <Link href="/profile" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-medium">Personal Information</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg">
          <Link href="/profile/personal/avatar" className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="text-gray-600">Avatar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={
                    profile.avatar ||
                    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.PNG-5C2AjGn89jYpJXWbMuG8p62ZtObDqW.png" ||
                    "/placeholder.svg"
                  }
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <span className="text-gray-600">Username</span>
            </div>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="text-gray-600 text-right"
            />
          </div>

          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <span className="text-gray-600">Gender</span>
            </div>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="text-gray-600 text-right"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="text-gray-600">Signature</span>
            </div>
            <input
              type="text"
              value={profile.signature}
              onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
              className="text-gray-600 text-right"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={saveProfile}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Save Changes
        </button>
      </div>
    </main>
  )
}
