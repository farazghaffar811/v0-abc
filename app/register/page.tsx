"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, User2, KeyRound, Share2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type React from "react"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  console.log("RegisterPage is rendering")

  const { register, error: authError, isLoading, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    fundPassword: "",
    fundPasswordConfirm: "",
    invitationCode: "",
  })

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    if (formData.fundPassword !== formData.fundPasswordConfirm) {
      setError("Fund passwords do not match")
      setIsSubmitting(false)
      return
    }

    if (formData.invitationCode !== "40007") {
      setError("Invalid invitation code")
      setIsSubmitting(false)
      return
    }

    try {
      await register(formData.email, formData.password, formData.invitationCode)
      router.push("/")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoadingState = isSubmitting || isLoading
  const errorMessage = error || authError

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <Image
              src="/images/design-mode/logo_super_scjghk%281%29%281%29.png"
              alt="SuperCoin"
              width={200}
              height={50}
              className="mx-auto"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <div className="relative">
              <Input
                type="email"
                name="email"
                placeholder="Please Enter Your Email"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoadingState}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <User2 className="h-5 w-5 text-gray-400 font-bold" />
              </div>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Please Enter New Login Password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoadingState}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="h-5 w-5 text-gray-400 font-bold" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                disabled={isLoadingState}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 font-bold" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 font-bold" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                placeholder="Please Enter Login Password Again"
                className="pl-10 pr-10"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoadingState}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="h-5 w-5 text-gray-400 font-bold" />
              </div>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="fundPassword"
                placeholder="Please Enter New Fund Password"
                className="pl-10 pr-10"
                value={formData.fundPassword}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoadingState}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="h-5 w-5 text-gray-400 font-bold" />
              </div>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="fundPasswordConfirm"
                placeholder="Please Enter Fund Password Again"
                className="pl-10 pr-10"
                value={formData.fundPasswordConfirm}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoadingState}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="h-5 w-5 text-gray-400 font-bold" />
              </div>
            </div>

            <div className="relative">
              <Input
                type="text"
                name="invitationCode"
                placeholder="Please Enter Agent Invitation Code"
                className="pl-10"
                value={formData.invitationCode}
                onChange={handleChange}
                required
                disabled={isLoadingState}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Share2 className="h-5 w-5 text-gray-400 font-bold" />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-button text-white" size="lg" disabled={isLoadingState}>
              {isLoadingState ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600">
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 space-y-1">
        <div>SuperCoin Technology</div>
        <div>All Rights Reserved</div>
        <div>©2015-2025</div>
      </footer>
    </div>
  )
}
