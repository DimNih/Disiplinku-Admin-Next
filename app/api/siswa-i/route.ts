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

    const siswaRef = ref(db, "siswa-i")
    const snapshot = await get(siswaRef)
    const data = snapshot.val() || {}
    const siswa = Object.values(data)

    return NextResponse.json(siswa)
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json({ error: "Gagal memuat data siswa" }, { status: 500 })
  }
}
