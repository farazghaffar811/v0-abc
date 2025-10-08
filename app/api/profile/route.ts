import { NextResponse } from "next/server"
import { headers } from "next/headers"

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"

// This is a mock database. In a real application, you'd use a proper database.
let mockUserProfile = {
  avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=ucoin",
  username: "JohnDoe",
  gender: "Male",
  signature: "Hello, World!",
}

export async function GET(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  return NextResponse.json(mockUserProfile, { headers: corsHeaders })
}

export async function POST(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  const updates = await request.json()
  mockUserProfile = { ...mockUserProfile, ...updates }
  return NextResponse.json(mockUserProfile, { headers: corsHeaders })
}

export async function OPTIONS(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  )
}
