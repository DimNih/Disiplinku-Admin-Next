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

    const pelanggaranRef = ref(db, "pelanggaran")
    const snapshot = await get(pelanggaranRef)
    const data = snapshot.val()
    const dates = data ? Object.keys(data) : []

    return NextResponse.json(dates)
  } catch (error) {
    console.error("Error fetching dates:", error)
    return NextResponse.json({ error: "Gagal memuat tanggal" }, { status: 500 })
  }
}
