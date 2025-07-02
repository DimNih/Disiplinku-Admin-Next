import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function validateApiKey(req: NextRequest, providedApiKey?: string) {
  // Get API key from header, query parameter, or provided value
  const apiKey = providedApiKey || req.headers.get("x-api-key") || new URL(req.url).searchParams.get("api_key")

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 })
  }

  try {
    // Check if API key exists and is active
    const apiKeysRef = ref(db, `api-keys/${apiKey}`)
    const snapshot = await get(apiKeysRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 })
    }

    // API key is valid
    return null
  } catch (error) {
    console.error("Error validating API key:", error)
    return NextResponse.json({ error: "Error validating API key" }, { status: 500 })
  }
}
