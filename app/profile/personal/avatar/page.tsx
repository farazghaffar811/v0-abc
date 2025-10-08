"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

const avatars = [
  {
    id: 1,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.PNG-5C2AjGn89jYpJXWbMuG8p62ZtObDqW.png",
    alt: "Man in white outfit",
  },
  {
    id: 2,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.PNG-BNWI4ueUJOyc6jI04AByIMQr7TYpq1.png",
    alt: "Man with glasses",
  },
  {
    id: 3,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.PNG-0ErMbz6kLTbMJxBRI8VMZv4Lj3MwlH.png",
    alt: "Man in white shirt",
  },
  {
    id: 4,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.PNG-BIWfo5xNY3PCqIuag0Ftd8FcicODKW.png",
    alt: "Man in traditional gold attire",
  },
  {
    id: 5,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.PNG-2hyygt9fukMJa0OQZANDEbCegsUmZQ.png",
    alt: "Man in maroon shirt",
  },
  {
    id: 6,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6.PNG-UCUEH9WPnxETWTnzLpmQzD0h36wzBO.png",
    alt: "Man in pink traditional attire",
  },
  {
    id: 7,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7.PNG-g9Stt5B12WTB6fbj1W4GGrcVLZ9xoh.png",
    alt: "Man in white and gold attire",
  },
  {
    id: 8,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8.PNG-nPNpHwlquiS8CUeT6a1O6jRKMYRfyW.png",
    alt: "Man in patterned traditional wear",
  },
  {
    id: 9,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9.PNG-cE1taazhsPLbjP45cjzaEjm9UmJYUD.png",
    alt: "Man in yellow turban",
  },
  {
    id: 10,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10.PNG-jLhmXDLgxpSBNwitsL62eWO5Lizjbq.png",
    alt: "Man in white outfit outdoors",
  },
  {
    id: 11,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11.PNG-YE9ZVdEOd5kuLubK2043Rvrl6C1tY6.png",
    alt: "Man in white traditional outfit with open arms",
  },
  {
    id: 12,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12.PNG-ttkFrEWKTz6dZtJmiMqlu2diKuDmFU.png",
    alt: "Man with beard in neutral background",
  },
  {
    id: 13,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/13.PNG-Gx1L8jgBXKHB0FLovFtqRUKOSTfNnl.png",
    alt: "Man in white at beach/waterfront",
  },
  {
    id: 14,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14.PNG-7Un5oxn0jTGQQDkeUwOnyn3FnH41Hu.png",
    alt: "Man with long hair in beige jacket",
  },
  {
    id: 15,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15.PNG-i6CAS5yYeCfpHGpID3ni1jxRYrOaKb.png",
    alt: "Man in blue formal shirt",
  },
  {
    id: 16,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16.PNG-DivHhtKwen5xhFoPS2cuEwZokeO7w4.png",
    alt: "Man in black jacket close-up",
  },
  {
    id: 17,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17.PNG-AEG9ifjU4quWTbQ5nWm03zEIPMU9vw.png",
    alt: "Man in denim jacket smiling",
  },
  {
    id: 18,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18.PNG-MvNLRoznaleQqyVxF1LNAHTm5Tf699.png",
    alt: "Man in green floral jacket",
  },
  {
    id: 19,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19.PNG-GMitdEo2luIuN5uvP9vj7BmQ81kjca.png",
    alt: "Man in black suit and tie",
  },
  {
    id: 20,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20.PNG-ruYVhztDBdu4wScLK4YZy7JYX9fjJF.png",
    alt: "Man in red outfit with necklace",
  },
  {
    id: 21,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/21.PNG-jLXuGAiS2HwahNv3ZdfZAB0k6UNjfn.png",
    alt: "Young man shirtless in white background",
  },
  {
    id: 22,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/22.PNG-A1roIDtrr34c9YLSrNXRNHvB02rlzk.png",
    alt: "Man smiling with purple flower outdoors",
  },
  {
    id: 23,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/23.PNG-nZzjzcK3DNpx4wKhQCsfDe61NevTz4.png",
    alt: "Shirtless man in artistic pose against gray background",
  },
  {
    id: 24,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/24.PNG-kJKOB2Yd9kQRPDoKanXjUHYpj9imnu.png",
    alt: "Close-up selfie of man in green shirt",
  },
  {
    id: 25,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/25.PNG-seVkWUvGb0EAGbDNz4wgI9pikTL92O.png",
    alt: "Man smiling with pretzel/pastry",
  },
  {
    id: 26,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/26.PNG-OQ80qJiwoiI5iggiB1kyZ7sQEUNg3H.png",
    alt: "Man in plaid jacket on stairs",
  },
  {
    id: 27,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27.PNG-4XGsCUNTbcAfsdmrZdagoUvBunGp2Z.png",
    alt: "Artistic black and white portrait with hand pose",
  },
  {
    id: 28,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/28.PNG-a5HPqwXwHVNc35ZVLDfwj9JqMlMlQj.png",
    alt: "Casual portrait of man with curly hair",
  },
  {
    id: 29,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/29.PNG-HbbmhonioLIZfxkeLKBI6SSWdbKoAO.png",
    alt: "Selfie of smiling man with curly hair",
  },
  {
    id: 30,
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/30.PNG-RD73J81RQPw6CrZZ7jhVXcZv21kMJW.png",
    alt: "Close-up portrait of man with dark hair indoors",
  },
]

export default function AvatarSelectionPage() {
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchCurrentAvatar()
  }, [])

  const fetchCurrentAvatar = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      setSelectedAvatar(data.avatar)
    } catch (error) {
      console.error("Error fetching current avatar:", error)
    }
  }

  const saveAvatar = async () => {
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar: selectedAvatar }),
      })
      router.push("/profile/personal")
    } catch (error) {
      console.error("Error saving avatar:", error)
      alert("Failed to save avatar. Please try again.")
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/profile/personal" className="mr-4">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-medium">Select Avatar</h1>
          </div>
          <button
            onClick={saveAvatar}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Save
          </button>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-medium mb-4 px-2">Male</h2>
        <div className="grid grid-cols-5 gap-3 px-2">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`relative cursor-pointer rounded-full overflow-hidden aspect-square ${
                selectedAvatar === avatar.url
                  ? "ring-4 ring-blue-500 ring-offset-2"
                  : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-1"
              }`}
              onClick={() => setSelectedAvatar(avatar.url)}
            >
              <Image
                src={avatar.url || "/placeholder.svg"}
                alt={avatar.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 150px, 200px"
              />
            </div>
          ))}
        </div>
        <h2 className="text-lg font-medium mb-4 px-2 mt-8">Female</h2>
      </div>
    </main>
  )
}
