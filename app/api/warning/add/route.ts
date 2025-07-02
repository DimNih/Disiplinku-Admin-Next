import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { nis, message, timestamp } = await request.json()

    if (!nis || !message || !timestamp) {
      return NextResponse.json({ error: "NIS, pesan, dan timestamp diperlukan" }, { status: 400 })
    }

    // Find student by NIS
    const siswaRef = ref(db, "siswa-i")
    const siswaSnapshot = await get(siswaRef)
    const siswaData = siswaSnapshot.val() || {}

    let siswa = null
    let siswaKey = null

    for (const key in siswaData) {
      if (siswaData[key].nis === nis) {
        siswa = siswaData[key]
        siswaKey = key
        break
      }
    }

    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
    }

    // Create warning
    const warningData = {
      nis,
      name: siswa.name,
      kelas: siswa.kelas,
      message,
      timestamp,
    }

    const peringatanRef = ref(db, "peringatan-popup")
    const newWarningRef = push(peringatanRef)
    await set(newWarningRef, warningData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding warning:", error)
    return NextResponse.json({ error: "Gagal menambah peringatan" }, { status: 500 })
  }
}
