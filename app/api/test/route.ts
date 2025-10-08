import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  console.log("GET /api/test - Start")
  try {
    const testDoc = await adminDb.collection("test").doc("test").get()
    const exists = testDoc.exists
    console.log("Test document exists:", exists)
    return NextResponse.json({ success: true, documentExists: exists })
  } catch (error) {
    console.error("Error in test route:", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      {
        error: "Test route failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  } finally {
    console.log("GET /api/test - End")
  }
}
