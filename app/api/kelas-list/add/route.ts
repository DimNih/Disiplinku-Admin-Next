import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { ref, get, set } from "firebase/database"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { grade, major, className } = await request.json()

    if (!grade || !major || !className) {
      return NextResponse.json({ error: "Grade, major, dan className diperlukan" }, { status: 400 })
    }

    const classPath = `${grade}/${major}/${className}`
    const kelasRef = ref(db, `kelas-list/grades/${classPath}`)

    const snapshot = await get(kelasRef)
    if (snapshot.exists()) {
      return NextResponse.json({ error: "Kelas sudah ada" }, { status: 400 })
    }

    await set(kelasRef, { createdAt: Date.now() })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding class:", error)
    return NextResponse.json({ error: "Gagal menambah kelas" }, { status: 500 })
  }
}
