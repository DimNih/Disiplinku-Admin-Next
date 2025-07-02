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

    const osisRef = ref(db, "user-name-admin")
    const snapshot = await get(osisRef)
    const data = snapshot.val() || {}
    const osis = Object.values(data)

    return NextResponse.json(osis)
  } catch (error) {
    console.error("Error fetching OSIS:", error)
    return NextResponse.json({ error: "Gagal memuat data OSIS" }, { status: 500 })
  }
}
