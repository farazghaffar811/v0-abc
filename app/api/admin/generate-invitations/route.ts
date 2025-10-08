import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"

function generateInviteCode(length = 6): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
}

export async function POST(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const body = await request.text()
    let count = 1

    if (body) {
      try {
        const parsedBody = JSON.parse(body)
        if (typeof parsedBody.count === "number" && parsedBody.count > 0) {
          count = parsedBody.count
        }
      } catch (parseError) {
        console.error("Error parsing request body:", parseError)
      }
    }

    const invitationCodes = []
    const batch = adminDb.batch()

    for (let i = 0; i < count; i++) {
      const code = generateInviteCode()
      const docRef = adminDb.collection("invitations").doc()
      batch.set(docRef, {
        code,
        createdAt: FieldValue.serverTimestamp(),
        used: false,
      })
      invitationCodes.push(code)
    }

    await batch.commit()

    return NextResponse.json(
      {
        success: true,
        invitationCodes,
        message: `${count} invitation code(s) created successfully`,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error creating invitation codes:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create invitation codes",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    )
  }
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
