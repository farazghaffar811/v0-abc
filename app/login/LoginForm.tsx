"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, User, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      console.log("Attempting to log in...")
      const result = await login(email, password)
      console.log("Login result:", result)

      if (result.success) {
        console.log("Login successful, redirecting...")
        // We'll let the AuthContext handle the redirection
      } else {
        console.error("Login failed:", result.error)
        setError(result.error || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Unexpected login error:", error)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="w-full max-w-sm space-y-8">
       <div className="text-center">
  <div className="text-2xl font-semibold tracking-tight">
    <span className="bg-gradient-to-r from-purple-500 to-violet-700 bg-clip-text text-transparent">
      Coin
    </span>
    <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
      base
    </span>
  </div>
</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="relative">
            <Input
              type="email"
              placeholder="Your Email"
              className="pl-10 w-full h-12 rounded-lg border border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <User className="h-5 w-5 text-gray-400 font-bold" />
            </div>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password Length 6~30"
              className="pl-10 pr-10 w-full h-12 rounded-lg border border-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={30}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 text-gray-400 font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 font-bold" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 font-bold" />
              )}
            </button>
          </div>

          <Button type="submit" className="w-full h-12 gradient-button text-white rounded-lg">
            Login
          </Button>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-600">No UserName? </span>
          <Link href="/register" className="text-blue-600">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  )
}
