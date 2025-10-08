import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"

export async function POST(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin")

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { invitationCode, email } = await request.json()

    if (!invitationCode) {
      return NextResponse.json(
        { success: false, message: "Invitation code is required" },
        { status: 400, headers: corsHeaders },
      )
    }

    console.log("Validating invitation code:", invitationCode)

    const invitationsRef = collection(db, "invitations")
    const q = query(invitationsRef, where("code", "==", invitationCode))
    const querySnapshot = await getDocs(q)

    console.log("Query results:", querySnapshot.size)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Invalid invitation code" },
        { status: 400, headers: corsHeaders },
      )
    }

    const invitationDoc = querySnapshot.docs[0]
    const invitationData = invitationDoc.data()

    console.log("Invitation data:", invitationData)

    if (invitationData.used) {
      return NextResponse.json(
        { success: false, message: "This invitation code has already been used" },
        { status: 400, headers: corsHeaders },
      )
    }

    await updateDoc(doc(db, "invitations", invitationDoc.id), {
      used: true,
      usedBy: email,
      usedAt: serverTimestamp(),
    })

    return NextResponse.json(
      { success: true, message: "Invitation code is valid" },
      { status: 200, headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error validating invitation code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while validating the invitation code",
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
