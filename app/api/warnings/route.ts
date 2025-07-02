import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { ref, get } from "firebase/database"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const peringatanRef = ref(db, "peringatan-popup")
    const snapshot = await get(peringatanRef)
    const data = snapshot.val() || {}
    const warnings = Object.values(data)

    return NextResponse.json(warnings)
  } catch (error) {
    console.error("Error fetching warnings:", error)
    return NextResponse.json({ error: "Gagal memuat peringatan" }, { status: 500 })
  }
}
