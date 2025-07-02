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

    const kelasListRef = ref(db, "kelas-list/grades")
    const snapshot = await get(kelasListRef)
    const data = snapshot.val() || {}

    const classList = []
    for (const grade in data) {
      for (const major in data[grade]) {
        for (const className in data[grade][major]) {
          classList.push({ grade, major, className })
        }
      }
    }

    return NextResponse.json(classList)
  } catch (error) {
    console.error("Error fetching class list:", error)
    return NextResponse.json({ error: "Gagal memuat daftar kelas" }, { status: 500 })
  }
}
